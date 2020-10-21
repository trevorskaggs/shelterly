from django.shortcuts import get_object_or_404, render, redirect

from animals.models import Animal
from shelter.models import Shelter, Building, Room
from shelter.forms import ShelterForm, BuildingForm, RoomForm
from rest_framework import viewsets, generics
from actstream import action
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from .serializer import ShelterSerializer, BuildingSerializer, RoomSerializer

class ShelterViewSet(viewsets.ModelViewSet):
    queryset = Shelter.objects.all()
    serializer_class = ShelterSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():
            shelter = serializer.save()
            action.send(self.request.user, verb='created shelter', target=shelter)

    def perform_update(self, serializer):
        if serializer.is_valid():
            shelter = serializer.save()
            action.send(self.request.user, verb='updated shelter', target=shelter)

class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ('shelter',)

    def perform_create(self, serializer):
        if serializer.is_valid():
            building = serializer.save()
            action.send(self.request.user, verb='created building', target=building)

    def perform_update(self, serializer):
        if serializer.is_valid():
            building = serializer.save()
            action.send(self.request.user, verb='updated building', target=building)

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ('building',)

    def perform_create(self, serializer):
        if serializer.is_valid():
            room = serializer.save()
            action.send(self.request.user, verb='created room', target=room)

    def perform_update(self, serializer):
        if serializer.is_valid():
            room = serializer.save()
            action.send(self.request.user, verb='updated room', target=room)
