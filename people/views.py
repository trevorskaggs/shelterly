from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import permissions, viewsets

from animals.models import Animal
from hotline.models import ServiceRequest
from people.forms import PersonForm
from people.models import Person
from people.serializers import PersonSerializer


# Provides view for Person API calls.
class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = PersonSerializer
