from django.conf import settings
from django.shortcuts import render
from django.db import transaction
from django.db.models import Q
import operator
from functools import reduce
from django.shortcuts import get_object_or_404
from copy import deepcopy
from datetime import datetime
from rest_framework import filters, permissions, viewsets
from actstream import action

from animals.models import Animal, AnimalImage, Species
from animals.serializers import AnimalSerializer, ModestAnimalSerializer, SpeciesSerializer
from incident.models import Incident
from shelter.models import IntakeSummary
from people.serializers import SimplePersonSerializer
from vet.models import MedicalRecord, VetRequest

class MultipleFieldLookupMixin(object):
    def get_object(self):
        queryset = self.get_queryset()             # Get the base queryset
        queryset = self.filter_queryset(queryset)  # Apply any filter backends
        filter = {}
        for field in self.lookup_fields:
            if self.kwargs.get(field, None):
                filter[field] = self.kwargs[field]
        obj = get_object_or_404(queryset, **filter)
        return obj

class AnimalViewSet(MultipleFieldLookupMixin, viewsets.ModelViewSet):
    queryset = Animal.objects.with_images().exclude(status="CANCELED")
    lookup_fields = ['pk', 'incident', 'id_for_incident']
    search_fields = ['name', 'microchip', 'address', 'city', 'request__address', 'request__city', 'owners__address', 'owners__city', 'owners__last_name', 'reporter__last_name']
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = ModestAnimalSerializer
    detail_serializer_class = AnimalSerializer

    def get_serializer_class(self):
        if self.action == 'retrieve':
            if hasattr(self, 'detail_serializer_class'):
                return self.detail_serializer_class
        return super(AnimalViewSet, self).get_serializer_class()

    # @transaction.atomic
    def perform_create(self, serializer):
        from evac.models import AssignedRequest

        if serializer.is_valid():
            
            # Set status to SHELTERED if a shelter is added.
            if serializer.validated_data.get('shelter'):
                serializer.validated_data['status'] = 'SHELTERED'
                serializer.validated_data['intake_date'] = datetime.now()

            if self.request.data.get('incident_slug'):
                serializer.validated_data['incident'] = Incident.objects.get(slug=self.request.data.get('incident_slug'), organization__slug=self.request.data.get('organization_slug'))

            total_animals = Animal.objects.select_for_update().filter(incident__slug=self.request.data.get('incident_slug'), organization__slug=self.request.data.get('organization_slug')).values_list('id', flat=True)
            with transaction.atomic():
                count = len(total_animals)
                serializer.validated_data['id_for_incident'] = count + 1
                animal = serializer.save()
            animals = [animal]
            action.send(self.request.user, verb='created animal', target=animal)

            # Add Owner to new animals if included.
            if self.request.data.get('new_owner', 'undefined') != 'undefined':
                animal.owners.add(self.request.data['new_owner'])
            if self.request.data.get('new_owners', 'undefined') != 'undefined':
                animal.owners.add(*self.request.data['new_owners'].split(','))

            # Add ServiceRequest Owners and update AssignedRequest if new animals are being added to an SR.
            if serializer.validated_data.get('request'):
                animal.owners.add(*animal.request.owners.all())
                animal_dict = {
                  "id_for_incident":animal.id_for_incident,
                  'animal_count':animal.animal_count,
                  "name": animal.name,
                  "age": animal.age,
                  "sex": animal.sex,
                  "size": animal.size,
                  "species": animal.species.name,
                  "status": animal.status,
                  "color_notes": animal.color_notes,
                  "pcolor": animal.pcolor,
                  "scolor": animal.scolor,
                  "last_seen": animal.last_seen,
                  "shelter": animal.shelter,
                  "room": animal.room,
                  'animal_notes':animal.behavior_notes,
                  "medical_notes": animal.medical_notes,
                  'aggressive':animal.aggressive,
                  'aco_required':animal.aco_required,
                  'injured':animal.injured,
                  "fixed": animal.fixed,
                  "confined": animal.confined,
                  "is_new": True,
                }
                for assigned_request in AssignedRequest.objects.filter(service_request=serializer.validated_data.get('request'), dispatch_assignment__end_time=None):
                    assigned_request.animals[str(serializer.instance.id)] = animal_dict
                    assigned_request.save()

            # Create VR data if Triage is yellow or red.
            if self.request.data.get('priority', 'green') in ['when_available', 'urgent']:
                med_record, _ = MedicalRecord.objects.get_or_create(patient=animal)
                animal.medical_record=med_record
                animal.save()
                vet_request = VetRequest.objects.create(open=datetime.now(), priority=self.request.data.get('priority'), requested_by=self.request.user, caution=self.request.data.get('caution', 'false') == 'true', complaints_other=self.request.data.get('complaints_other'), concern=self.request.data.get('concern'), medical_record=med_record)
                vet_request.presenting_complaints.add(*self.request.data.get('presenting_complaints').split(','))

            if animal.shelter:
                action.send(self.request.user, verb='sheltered animal in', target=animal, action_object=animal.shelter)
                action.send(self.request.user, verb='sheltered animal', target=animal.shelter, action_object=animal)

            if animal.room:
                action.send(self.request.user, verb='roomed animal in', target=animal, action_object=animal.room)
                action.send(self.request.user, verb='roomed animal', target=animal.room, action_object=animal)
                action.send(self.request.user, verb='roomed animal', target=animal.room.building, action_object=animal)

            images_data = self.request.FILES
            for key, image_data in images_data.items():
                # Strip out extra numbers from the key (e.g. "extra1" -> "extra")
                category = key.translate({ord(num): None for num in '0123456789'})
                # Create image object.
                AnimalImage.objects.create(image=image_data, animal=animal, category=category)

            # Check to see if there is an intake summary
            if self.request.data.get('intake_summary', False):
                IntakeSummary.objects.get(pk=self.request.data.get('intake_summary')).animals.add(*animals)

            # Check to see if animal SR status should be changed.
            if animal.request:
                animal.request.update_status(self.request.user)

    def perform_update(self, serializer):
        from evac.models import AssignedRequest

        if serializer.is_valid():

            # Keep owner the same when editing an animal.
            serializer.validated_data['owners'] = serializer.instance.owners.values_list('id', flat=True)

            # Mark as SHELTERED if we receive shelter field and it's not already in a shelter.
            if serializer.validated_data.get('shelter') and not serializer.instance.shelter:
                serializer.validated_data['status'] = 'SHELTERED'
                serializer.validated_data['intake_date'] = datetime.now()
                action.send(self.request.user, verb='sheltered animal in', target=serializer.instance, action_object=serializer.validated_data.get('shelter'))
                action.send(self.request.user, verb='sheltered animal', target=serializer.validated_data.get('shelter'), action_object=serializer.instance)

            # If animal already had a shelter and now has a different shelter.
            if serializer.validated_data.get('shelter') and serializer.instance.shelter and serializer.instance.shelter != serializer.validated_data.get('shelter'):
                action.send(self.request.user, verb='sheltered animal in', target=serializer.instance, action_object=serializer.validated_data.get('shelter'))
                action.send(self.request.user, verb='sheltered animal', target=serializer.validated_data.get('shelter'), action_object=serializer.instance)

            # If animal had a shelter and now doesn't or has a different shelter.
            if serializer.instance.shelter and (serializer.instance.shelter != serializer.validated_data.get('shelter', serializer.instance.shelter)):
                action.send(self.request.user, verb='removed animal', target=serializer.instance.shelter, action_object=serializer.instance)

            # If animal had a room and now doesn't or has a different room.
            if serializer.instance.room and (not serializer.validated_data.get('room') or serializer.instance.room != serializer.validated_data.get('room')):
                action.send(self.request.user, verb='removed animal', target=serializer.instance.room, action_object=serializer.instance)
                action.send(self.request.user, verb='removed animal', target=serializer.instance.room.building, action_object=serializer.instance)

            # If animal is added to a new room from no room or a different room.
            if serializer.validated_data.get('room') and (serializer.instance.room != serializer.validated_data.get('room')):
                action.send(self.request.user, verb='roomed animal in', target=serializer.instance, action_object=serializer.validated_data.get('room'))
                action.send(self.request.user, verb='roomed animal', target=serializer.validated_data.get('room'), action_object=serializer.instance)
                action.send(self.request.user, verb='roomed animal', target=serializer.validated_data.get('room').building, action_object=serializer.instance)

            # Record status change if appplicable.
            if serializer.instance.status != serializer.validated_data.get('status', serializer.instance.status):
                new_status = serializer.validated_data.get('status')
                if serializer.instance.request:
                    serializer.instance.request.update_status(self.request.user)
                    for assigned_request in AssignedRequest.objects.filter(service_request=serializer.instance.request, dispatch_assignment__end_time=None):
                        assigned_request.animals[str(serializer.instance.id)]['status'] = new_status
                        assigned_request.save()

                    # AssignedRequest.objects.filter(service_request=serializer.instance.request, dispatch_assignment__end_time=None).update(animals=Func(
                    #   F("animals"),
                    #   Value([str(serializer.instance.id)]),
                    #   Value(["status"]),
                    #   Value("REUNITED", JSONField()),
                    #   function="jsonb_set",
                    # ))
                action.send(self.request.user, verb=f'changed animal status to {new_status}', target=serializer.instance)

            # Identify if there were any animal changes that aren't status, shelter, room, or owner.
            changed_fields = []
            for field, value in serializer.validated_data.items():
                new_value = value
                old_value = getattr(serializer.instance, field)
                if field not in ['status', 'room', 'shelter', 'owners'] and new_value != old_value:
                    changed_fields.append(field)

            animal = serializer.save()

            # Remove animal.
            if self.request.data.get('remove_animal'):
                Animal.objects.filter(id=self.request.data.get('remove_animal')).update(status='CANCELED', shelter=None, room=None)
                animal = Animal.objects.get(id=self.request.data.get('remove_animal'))
                for assigned_request in AssignedRequest.objects.filter(service_request=animal.request, dispatch_assignment__end_time=None):
                    assigned_request.animals[str(self.request.data.get('remove_animal'))]['status'] = 'CANCELED'
                    assigned_request.save()

            # Only record animal update if a field other than status, shelter, room, or owner has changed.
            if len(changed_fields) > 0:
                action.send(self.request.user, verb='updated animal', target=animal)

            # Remove Owner from animal.
            if self.request.data.get('remove_owner'):
                animal.owners.remove(self.request.data.get('remove_owner'))
            # Split group
            elif self.request.data.get('group_2'):
                total_animals = Animal.objects.select_for_update().filter(incident__slug=self.request.data.get('incident')).values_list('id', flat=True)
                with transaction.atomic():
                    count = len(total_animals)
                    new_animal = deepcopy(animal)
                    new_animal.id = None
                    new_animal.animal_count = self.request.data.get('group_2')
                    new_animal.id_for_incident = count
                    new_animal.save()
                    new_animal.owners.set(animal.owners.all())

            # Check if any original front/side images need to be removed.
            for key in ("front_image", "side_image"):
                if key in self.request.FILES.keys() or not self.request.data.get(key, ''):
                    AnimalImage.objects.filter(animal=animal, category=key).delete()

            def strip_s3(url):
                return url.split("?AWSAccessKeyId")[0]

            # Remove extra images that have been removed.
            if 'extra_images' in self.request.data:
                extra_data = self.request.data.get('extra_images', '')
                extra_images_list = extra_data if type(extra_data) is list else extra_data.split(',')
                remaining_extra_urls = [strip_s3(url) for url in extra_images_list]
                for extra_image in AnimalImage.objects.filter(animal=animal, category="extra"):
                    if strip_s3(extra_image.image.url) not in remaining_extra_urls:
                        extra_image.delete()

            #Create new files from uploads
            for key in self.request.FILES.keys():
                image_data = self.request.FILES[key]
                key = key if key in ("front_image", "side_image") else "extra"
                AnimalImage.objects.create(image=image_data, animal=animal, category=key)

            # Check to see if animal SR status should be changed.
            if animal.request:
                animal.request.update_status(self.request.user)

    def get_queryset(self):
        """
        Returns: Queryset of distinct animals, each annotated with:
            images (List of AnimalImages)
        """
        queryset = (
            Animal.objects.with_images().with_history().exclude(status="CANCELED").distinct()
            .prefetch_related("owners")
            .select_related("reporter", "room", "request", "shelter")
        )
        if self.request.GET.get('incident'):
            queryset = queryset.filter(incident__slug=self.request.GET.get('incident'), incident__organization__slug=self.request.GET.get('organization'))
        return queryset

class SpeciesViewSet(viewsets.ModelViewSet):
    queryset = Species.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = SpeciesSerializer

def print_kennel_card(request, incident, animal_id):
    animal = Animal.objects.get(id=animal_id)
    owners = SimplePersonSerializer(animal.owners.all(), many=True).data
    context={"animal":animal, "owners":owners, "care_schedule_rows": range(30)}
    return render(request, "ui/animals/print.html", context)    
