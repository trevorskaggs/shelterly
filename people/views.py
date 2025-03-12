from django.db.models import Exists, OuterRef, Prefetch, Q
from rest_framework import filters, permissions, serializers, viewsets
from actstream import action

from animals.models import Animal
from hotline.models import ServiceRequest
from incident.models import Incident, Organization
from people.models import OwnerContact, Person, PersonChange, PersonImage
from people.serializers import OwnerContactSerializer, PersonSerializer, HeavyPersonSerializer, SimplePersonSerializer


# Provides view for Person API calls.
class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    search_fields = ['first_name', 'last_name', 'address', 'city', 'phone', 'email', 'drivers_license', 'animal__name', 'reporter_animals__name',]
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PersonSerializer
    light_serializer_class = SimplePersonSerializer
    detail_serializer_class = HeavyPersonSerializer

    def get_serializer_class(self):
        if self.action == 'retrieve':
            if hasattr(self, 'detail_serializer_class'):
                return self.detail_serializer_class
        elif self.action == 'list':
            if self.request.GET.get('light', 'false') == 'true' and hasattr(self, 'light_serializer_class'):
                return self.light_serializer_class
        return super(PersonViewSet, self).get_serializer_class()

    def get_queryset(self):
        queryset = Person.objects.with_history().all()
        if self.request.GET.get('training'):
            queryset = queryset.filter(incident__organization__slug=self.request.GET.get('organization'), incident__training=self.request.GET.get('training') == 'true')
        queryset = (
            queryset
            .annotate(is_owner=Exists(Animal.objects.filter(incident__slug=self.request.GET.get('incident', ''), owners=OuterRef("id"))))
            .annotate(is_reporter=Exists(Animal.objects.filter(incident__slug=self.request.GET.get('incident', ''), reporter=OuterRef("id"))))
            .prefetch_related(
                Prefetch(
                    "animal_set",
                    queryset=Animal.objects.filter(incident__slug=self.request.GET.get('incident', '')).exclude(status='CANCELED').with_images().prefetch_related('owners'),
                    to_attr="animals",
                )
            )
            .prefetch_related(
                Prefetch(
                    "reporter_animals",
                    queryset=Animal.objects.filter(incident__slug=self.request.GET.get('incident', '')).exclude(status='CANCELED').with_images().prefetch_related('owners'),
                )
            )
            .prefetch_related(
                Prefetch(
                    "request",
                    queryset=ServiceRequest.objects.filter(incident__slug=self.request.GET.get('incident', '')).exclude(status='canceled'),
                )
            )
            .prefetch_related(
                Prefetch(
                    "reporter_service_request",
                    queryset=ServiceRequest.objects.filter(incident__slug=self.request.GET.get('incident', '')).exclude(status='canceled'),
                )
            )
            .prefetch_related("ownercontact_set")
        )
        # Status filter.
        status = self.request.query_params.get("status", "")
        if status == "owners":
            queryset = queryset.filter(is_owner=True)
        elif status == "reporters":
            queryset = queryset.filter(is_reporter=True)
        elif 'status' in self.request.query_params:
            queryset = queryset.filter(Q(is_owner=True)|Q(is_reporter=True))
        return queryset


    def perform_create(self, serializer):
        if serializer.is_valid():
            # Check for duplicate owners. Obsolete.
            # for owner in Person.objects.filter(first_name=serializer.validated_data['first_name'], last_name=serializer.validated_data['last_name'], phone=serializer.validated_data['phone'], incident__slug=self.request.data.get('incident_slug')):
            #     raise serializers.ValidationError(['a duplicate owner with the same name and phone number already exists.', owner.id])
            # Clean phone fields.
            serializer.validated_data['phone'] = ''.join(char for char in serializer.validated_data.get('phone', '') if char.isdigit())
            serializer.validated_data['alt_phone'] = ''.join(char for char in serializer.validated_data.get('alt_phone', '') if char.isdigit())
            person = serializer.save()
            action.send(self.request.user, verb='created person', target=person)

            # If an owner is being added to an existing SR, add the owner to the SR and update all SR animals with the owner.
            if self.request.data.get('request'):
                service_request = ServiceRequest.objects.get(pk=self.request.data.get('request'))
                service_request.owners.add(person)
                for animal in service_request.animal_set.all():
                    animal.owners.add(person)

            # If an owner is being added from an animal, update the animal with the new owner.
            if self.request.data.get('animal'):
                animal = Animal.objects.get(id_for_incident=self.request.data.get('animal'), incident__slug=self.request.data.get('incident_slug'))
                animal.owners.add(person)
                if animal.request:
                    animal.request.owners.add(person)

            # If an owner is being added from another Person, add the new owner to the animals of the original Person.
            if self.request.data.get('owner'):
                owner = Person.objects.get(pk=self.request.data.get('owner'))
                for animal in owner.animal_set.all():
                    animal.owners.add(person)
                for animal in owner.reporter_animals.all():
                    animal.owners.add(person)
                # If the original owner belongs to an SR, update the SR with the new owner.
                for service_request in ServiceRequest.objects.filter(Q(owners=owner)|Q(reporter=owner)):
                    service_request.owners.add(person)

    def perform_update(self, serializer):
        from evac.models import AssignedRequest

        if serializer.is_valid():
            # Clean phone fields.
            serializer.validated_data['phone'] = ''.join(char for char in serializer.validated_data.get('phone', '') if char.isdigit())
            serializer.validated_data['alt_phone'] = ''.join(char for char in serializer.validated_data.get('alt_phone', '') if char.isdigit())
            # Identify which fields changed on update.
            change_dict = {}
            for field, value in serializer.validated_data.items():
                new_value = value
                old_value = getattr(serializer.instance, field)
                if new_value != old_value:
                    change_dict[field] = f'{old_value} changed to {new_value}'

            person = serializer.save()

            # Store Person changes for investigation purposes.
            if change_dict:
                PersonChange.objects.create(user=self.request.user, person=person, changes=change_dict, reason=self.request.data.get('change_reason', ''))

            if self.request.data.get('reunite_animals'):
                requests = []
                for animal in person.animal_set.exclude(status__in=['DECEASED', 'NO FURTHER ACTION', 'REUNITED']):
                    action.send(self.request.user, verb=f'changed animal status to reunited', target=animal)
                    if animal.request and animal.request not in requests:
                        requests.append(animal.request)
                        for assigned_request in AssignedRequest.objects.filter(service_request=animal.request.id, dispatch_assignment__end_time=None):
                            assigned_request.animals[str(person.id)]['status'] = 'REUNITED'
                            assigned_request.save()
                person.animal_set.exclude(status__in=['DECEASED', 'NO FURTHER ACTION', 'REUNITED']).update(status='REUNITED', shelter=None, room=None)
                for service_request in requests:
                    service_request.update_status(self.request.user)

            elif self.request.FILES.keys():
                # Create new files from uploads
                for key in self.request.FILES.keys():
                    image_data = self.request.FILES[key]
                    PersonImage.objects.create(image=image_data, name=self.request.data.get('name'), person=person)
            elif self.request.data.get('edit_image'):
                PersonImage.objects.filter(id=self.request.data.get('id')).update(name=self.request.data.get('edit_image'))
            elif self.request.data.get('remove_image'):
                PersonImage.objects.filter(id=self.request.data.get('remove_image')).delete()

            # If an owner is being added to an existing SR, add the owner to the SR and update all SR animals with the owner.
            elif self.request.data.get('request'):
                service_request = ServiceRequest.objects.get(pk=self.request.data.get('request'))
                service_request.owners.add(person)
                for animal in service_request.animal_set.all():
                    animal.owners.add(person)

            # If an owner is being added from an animal, update the animal with the new owner.
            elif self.request.data.get('animal'):
                animal = Animal.objects.get(pk=self.request.data.get('animal'))
                animal.owners.add(person)

            # If an owner is being added from another Person, add the new owner to the animals of the original Person.
            elif self.request.data.get('owner'):
                owner = Person.objects.get(pk=self.request.data.get('owner'))
                for animal in owner.animal_set.all():
                    animal.owners.add(person)
                for animal in owner.reporter_animals.all():
                    animal.owners.add(person)
                # If the original owner belongs to an SR, update the SR with the new owner.
                for service_request in ServiceRequest.objects.filter(Q(owners=owner)|Q(reporter=owner)):
                    service_request.owners.add(person)
            else:
                # Record update action.
                action.send(self.request.user, verb='updated person', target=person)

class OwnerContactViewSet(viewsets.ModelViewSet):

    queryset = OwnerContact.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = OwnerContactSerializer
