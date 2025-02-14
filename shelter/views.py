
from shelter.models import Shelter, Building, IntakeSummary, Room
from rest_framework import viewsets
from actstream import action
from datetime import datetime
from actstream.models import Action
from django_filters import rest_framework as filters
from django.db.models import Count, Prefetch, Q, Sum
from rest_framework import permissions
from .serializers import ShelterSerializer, ModestShelterSerializer, BuildingSerializer, SimpleBuildingSerializer, RoomSerializer, IntakeSummarySerializer
from animals.models import Animal
from incident.models import Incident, Organization
from vet.models import MedicalRecord, VetRequest

class ShelterViewSet(viewsets.ModelViewSet):
    serializer_class = ShelterSerializer
    permission_classes = [permissions.IsAuthenticated, ]

    def get_serializer_class(self):
        if self.action == 'list':
            return ModestShelterSerializer
        return ShelterSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():
            # Clean phone fields.
            serializer.validated_data['phone'] = ''.join(char for char in serializer.validated_data.get('phone', '') if char.isdigit())

            shelter = serializer.save()
            action.send(self.request.user, verb='created shelter', target=shelter)

    def perform_update(self, serializer):
        if serializer.is_valid():
            # Clean phone fields.
            serializer.validated_data['phone'] = ''.join(char for char in serializer.validated_data.get('phone', '') if char.isdigit())

            shelter = serializer.save()
            action.send(self.request.user, verb='updated shelter', target=shelter)

    def get_queryset(self):
        queryset = Shelter.objects.all()
        if self.request.GET.get('training'):
            queryset = queryset.filter(incident__organization__slug=self.request.GET.get('organization'), incident__training=self.request.GET.get('training') == 'true')
        queryset = (queryset
            # .annotate(
            #     animal_count=Sum(
            #         "animal__animal_count",
            #         filter=~Q(animal__status="CANCELED")&Q(animal__incident__slug=self.request.GET.get('incident')),
            #         distinct=True
            #     )
            # )
            .prefetch_related(
                        Prefetch(
                            "intakesummary_set",
                            IntakeSummary.objects.filter(animals__incident__slug=self.request.GET.get('incident')).select_related("person")
                        )
                    )
            .prefetch_related(
                Prefetch(
                    "building_set",
                    Building.objects.with_history()
                    .annotate(
                        animal_count=Sum(
                            "room__animal__animal_count", filter=~Q(room__animal__status="CANCELED")&Q(room__animal__incident__slug=self.request.GET.get('incident'))
                        )
                    ).order_by('name')
                    .prefetch_related(
                        Prefetch(
                            "room_set",
                            Room.objects.with_history().annotate(
                                animal_count=Sum(
                                    "animal__animal_count", filter=~Q(animal__status="CANCELED")&Q(animal__incident__slug=self.request.GET.get('incident'))
                                )
                            ).prefetch_related(Prefetch('animal_set',Animal.objects.with_images().prefetch_related('owners').exclude(status='CANCELED').filter(incident__slug=self.request.GET.get('incident')), to_attr='animals')).order_by('name')
                        )
                    ).order_by('name'),
                )
            )
            .with_history().prefetch_related(Prefetch('animal_set', Animal.objects.filter(room=None, incident__slug=self.request.GET.get('incident', '')).exclude(status='CANCELED'), to_attr="unroomed_animals"))).distinct().order_by('name')
        if self.request.GET.get('medical', '') == 'true':
            queryset = queryset.filter(animal__medical_record__isnull=False)
        return queryset


class BuildingViewSet(viewsets.ModelViewSet):
    # add permissions
    queryset = Building.objects.all()
    # serializer_class = SimpleBuildingSerializer
    permission_classes = [permissions.IsAuthenticated, ]

    def get_serializer_class(self):
        if self.action == 'list':
            return SimpleBuildingSerializer
        return BuildingSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():
            building = serializer.save()
            action.send(self.request.user, verb='created building', target=building)

    def perform_update(self, serializer):
        if serializer.is_valid():
            building = serializer.save()
            action.send(self.request.user, verb='updated building', target=building)

    def get_queryset(self):
        return Building.objects.with_history().all().prefetch_related(
            Prefetch(
                "room_set",
                Room.objects
                .annotate(
                    animal_count=Sum("animal__animal_count", filter=~Q(animal__status="CANCELED")&Q(animal__incident__slug=self.request.GET.get('incident')))
                ).order_by('name')
            )
        )

class RoomViewSet(viewsets.ModelViewSet):
    # add permissions

    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated, ]

    def perform_create(self, serializer):
        if serializer.is_valid():
            room = serializer.save()
            action.send(self.request.user, verb='created room', target=room)

    def perform_update(self, serializer):
        if serializer.is_valid():
            room = serializer.save()
            action.send(self.request.user, verb='updated room', target=room)

    def get_queryset(self):
        return (
            Room.objects.select_related("building__shelter")
            .with_history()
            .prefetch_related(
                Prefetch(
                    "animal_set",
                    Animal.objects.select_related("request", "shelter")
                    .with_history()
                    .with_images()
                    .exclude(status="CANCELED")
                    .filter(incident__slug=self.request.GET.get('incident'))
                    .prefetch_related("owners"),
                    to_attr="animals",
                )
            )
            .annotate(
                animal_count=Sum("animal__animal_count", filter=~Q(animal__status="CANCELED")&Q(animal__incident__slug=self.request.GET.get('incident')))
            )
        )

class IntakeSummaryViewSet(viewsets.ModelViewSet):

    queryset = IntakeSummary.objects.all()
    serializer_class = IntakeSummarySerializer
    permission_classes = [permissions.IsAuthenticated, ]

    def get_queryset(self):
        return self.queryset.distinct()

    def perform_create(self, serializer):
        if serializer.is_valid():
            summary = serializer.save()
            # Create VR data if Triage is yellow or red.
            for sr_update in self.request.data.get('sr_updates', []):
                for animal_dict in sr_update.get('animals', []):
                    if animal_dict.get('id', False) and animal_dict.get('priority', 'green') in ['when_available', 'urgent']:
                        animal = Animal.objects.get(id=animal_dict['id'])
                        med_record, _ = MedicalRecord.objects.get_or_create(patient=animal)
                        animal.medical_record=med_record
                        animal.save()
                        vet_request = VetRequest.objects.create(open=datetime.now(), priority=animal_dict.get('priority'), requested_by=self.request.user, caution=animal_dict.get('caution', 'false') == 'true', complaints_other=animal_dict.get('complaints_other'), concern=animal_dict.get('concern'), medical_record=med_record)
                        vet_request.presenting_complaints.add(*animal_dict.get('presenting_complaints'))