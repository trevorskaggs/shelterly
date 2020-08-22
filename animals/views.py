
from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from rest_framework import filters, viewsets

from people.models import Person
from animals.models import Animal
from animals.forms import AnimalForm, ImageForm
from animals.serializers import AnimalSerializer


class AnimalViewSet(viewsets.ModelViewSet):

    queryset = Animal.objects.all()
    search_fields = ['name', 'species', 'status', 'request__address', 'request__city', 'owner__first_name', 'owner__last_name', 'owner__address', 'owner__city']
    filter_backends = (filters.SearchFilter,)
    serializer_class = AnimalSerializer

    # When creating, if the animal does not have an owner, create a dummy known owner and assign it.
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer = serializer.save()
            if not serializer.owner:
                owner = Person.objects.create(first_name="Unknown")
                serializer.owner = owner
                serializer.save()
