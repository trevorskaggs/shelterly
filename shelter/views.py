
from shelter.models import Shelter, Building, Room
from rest_framework import viewsets
from .serializer import ShelterSerializer, BuildingSerializer, RoomSerializer
from django_filters import rest_framework as filters


class ShelterViewSet(viewsets.ModelViewSet):
    queryset = Shelter.objects.all()
    serializer_class = ShelterSerializer


class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ('shelter',)


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ('shelter', 'building',)