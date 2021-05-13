from django.db.models import Exists, OuterRef, Prefetch
from rest_framework import filters, permissions, viewsets
from actstream import action

from animals.models import Animal
from hotline.models import ServiceRequest
from people.models import OwnerContact, Person, PersonChange
from people.serializers import OwnerContactSerializer, PersonSerializer


# Provides view for Person API calls.
class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    search_fields = ['first_name', 'last_name', 'address', 'phone', 'email', 'drivers_license', 'animals__name', 'animal__name']
    filter_backends = (filters.SearchFilter,)
    permission_classes = []
    serializer_class = PersonSerializer

    def get_queryset(self):
        queryset = Person.objects.all().annotate(
            is_owner=Exists(Animal.objects.filter(owners=OuterRef("id")))
        ).prefetch_related(Prefetch('animal_set', queryset=Animal.objects.prefetch_related(Prefetch('animalimage_set', to_attr='images')), to_attr='animals'))

        # Status filter.
        status = self.request.query_params.get('status', '')
        if status == 'owners':
            queryset = queryset.filter(is_owner=True)
        elif status == 'reporters':
            queryset = queryset.filter(is_owner=False)
        return queryset

    def perform_create(self, serializer):
        if serializer.is_valid():
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
                animal = Animal.objects.get(pk=self.request.data.get('animal'))
                animal.owners.add(person)

            # If an owner is being added from an owner, update the original owner animals with the new owner.
            if self.request.data.get('owner'):
                owner = Person.objects.get(pk=self.request.data.get('owner'))
                for animal in owner.animal_set.all():
                    animal.owners.add(person)
                # If the original owner belongs to an SR, update the SR with the new owner.
                for service_request in ServiceRequest.objects.filter(owners=owner):
                    service_request.owners.add(person)

    def perform_update(self, serializer):
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
                person.animal_set.exclude(status='DECEASED').update(status='REUNITED', shelter=None, room=None)
                for animal in person.animal_set.exclude(status='DECEASED'):
                    action.send(self.request.user, verb=f'changed animal status to reunited', target=animal)
                if person.request.exists():
                    service_request = person.request.first()
                    service_request.status = 'closed'
                    service_request.save()
                    action.send(self.request.user, verb='closed service request', target=service_request)
            else:
                # Record update action.
                action.send(self.request.user, verb='updated person', target=person)

class OwnerContactViewSet(viewsets.ModelViewSet):

    queryset = OwnerContact.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = OwnerContactSerializer
