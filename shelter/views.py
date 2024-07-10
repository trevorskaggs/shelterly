
from shelter.models import Shelter, Building, IntakeSummary, Room
from rest_framework import viewsets
from actstream import action
from actstream.models import Action
from django_filters import rest_framework as filters
from django.db.models import Count, Prefetch, Q
from rest_framework import permissions
from .serializers import ShelterSerializer, ModestShelterSerializer, SimpleBuildingSerializer, RoomSerializer, IntakeSummarySerializer
from animals.models import Animal
from incident.models import Incident, Organization

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
            .annotate(room_count=Count("building__room"))
            .annotate(
                animal_count=Count(
                    "animal",
                    filter=~Q(animal__status="CANCELED")&Q(animal__incident__slug=self.request.GET.get('incident')),
                    distinct=True
                )
            )
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
                        animal_count=Count(
                            "room__animal", filter=~Q(room__animal__status="CANCELED")&Q(room__animal__incident__slug=self.request.GET.get('incident'))
                        )
                    ).order_by('name')
                    .prefetch_related(
                        Prefetch(
                            "room_set",
                            Room.objects.with_history().annotate(
                                animal_count=Count(
                                    "animal", filter=~Q(animal__status="CANCELED")&Q(animal__incident__slug=self.request.GET.get('incident'))
                                )
                            ).prefetch_related(Prefetch('animal_set',Animal.objects.with_images().prefetch_related('owners').exclude(status='CANCELED').filter(incident__slug=self.request.GET.get('incident')), to_attr='animals')).order_by('name')
                        )
                    ).order_by('name'),
                )
            )
            .with_history().prefetch_related(Prefetch('animal_set', Animal.objects.filter(room=None, incident__slug=self.request.GET.get('incident', '')).exclude(status='CANCELED'), to_attr="unroomed_animals"))).order_by('name')
        if self.request.GET.get('medical', '') == 'true':
            queryset = queryset.filter(animal__medical_record__isnull=False)
        return queryset


class BuildingViewSet(viewsets.ModelViewSet):
    # add permissions
    queryset = Building.objects.all()
    serializer_class = SimpleBuildingSerializer
    permission_classes = [permissions.IsAuthenticated, ]

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
                    animal_count=Count("animal", filter=~Q(animal__status="CANCELED")&Q(animal__incident__slug=self.request.GET.get('incident')))
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
        )

class IntakeSummaryViewSet(viewsets.ModelViewSet):

    queryset = IntakeSummary.objects.all()
    serializer_class = IntakeSummarySerializer
    permission_classes = [permissions.IsAuthenticated, ]
