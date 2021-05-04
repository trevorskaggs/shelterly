
from shelter.models import Shelter, Building, Room
from rest_framework import viewsets
from actstream import action
from actstream.models import Action
from django_filters import rest_framework as filters
from django.db.models import Prefetch
from animals.models import Animal
from .serializers import ShelterSerializer, ModestShelterSerializer, SimpleBuildingSerializer, RoomSerializer

class ShelterViewSet(viewsets.ModelViewSet):
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

class BuildingViewSet(viewsets.ModelViewSet):
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

    def get_queryset(self):
        queryset = Building.objects.prefetch_related(
            Prefetch(
                "room_set",
                Room.objects.select_related("building__shelter").prefetch_related(
                    Prefetch(
                        "animal_set",
                        queryset=Animal.objects.exclude(status="CANCELED")
                        .prefetch_related(Prefetch("animalimage_set", to_attr="images"))
                        .prefetch_related(Prefetch("owners", to_attr="owner_objects")),
                        to_attr="animals",
                    )
                ),
                to_attr="rooms",
            )
        )
        return queryset


class RoomViewSet(viewsets.ModelViewSet):
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

    def get_queryset(self):
        queryset = (
            Room.objects.select_related("building__shelter")
            .prefetch_related(
                Prefetch(
                    "animal_set",
                    queryset=Animal.objects.exclude(status="CANCELED").prefetch_related(
                        Prefetch("animalimage_set", to_attr="images")
                    ).prefetch_related(Prefetch("owners", to_attr="owner_objects")),
                    to_attr="animals",
                )
            )
            .prefetch_related(
                Prefetch("target_actions", Action.objects.prefetch_related("action_object"))
            )
        )
        return queryset