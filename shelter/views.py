
from shelter.models import Shelter, Building, Room
from rest_framework import viewsets
from actstream import action
from actstream.models import Action
from django_filters import rest_framework as filters
from django.db.models import Count, Prefetch, Q
from .serializers import ShelterSerializer, ModestShelterSerializer, SimpleBuildingSerializer, RoomSerializer

class ShelterViewSet(viewsets.ModelViewSet):
    # add permissions
    queryset = Shelter.objects.all()
    serializer_class = ShelterSerializer

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
        return (
            Shelter.objects.annotate(room_count=Count("building__room"))
            .annotate(
                animal_count=Count(
                    "building__room__animal",
                    filter=~Q(building__room__animal__status="CANCELED"),
                )
            )
            .prefetch_related(
                Prefetch(
                    "building_set",
                    Building.objects.prefetch_related(
                        Prefetch("target_actions", Action.objects.prefetch_related("actor"))
                    )
                    .annotate(
                        animal_count=Count(
                            "room__animal", filter=~Q(room__animal__status="CANCELED")
                        )
                    )
                    .prefetch_related(
                        Prefetch(
                            "room_set",
                            Room.objects.prefetch_related(
                                Prefetch(
                                    "target_actions",
                                    Action.objects.prefetch_related("actor"),
                                )
                            ).annotate(
                                animal_count=Count(
                                    "animal", filter=~Q(animal__status="CANCELED")
                                )
                            ),
                        )
                    ),
                )
            )
            .prefetch_related(
                Prefetch("target_actions", Action.objects.prefetch_related("actor"))
            )
        )


class BuildingViewSet(viewsets.ModelViewSet):
    # add permissions

    queryset = Building.objects.all()
    serializer_class = SimpleBuildingSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():
            building = serializer.save()
            action.send(self.request.user, verb='created building', target=building)

    def perform_update(self, serializer):
        if serializer.is_valid():
            building = serializer.save()
            action.send(self.request.user, verb='updated building', target=building)

class RoomViewSet(viewsets.ModelViewSet):
    # add permissions

    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():
            room = serializer.save()
            action.send(self.request.user, verb='created room', target=room)

    def perform_update(self, serializer):
        if serializer.is_valid():
            room = serializer.save()
            action.send(self.request.user, verb='updated room', target=room)
