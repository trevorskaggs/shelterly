from django.core.files.storage import FileSystemStorage
from django.db.models import Q
from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from .serializers import ServiceRequestSerializer

from animals.models import Animal
from animals.forms import AnimalForm
from hotline.models import ServiceRequest
from hotline.forms import ServiceRequestForm, ServiceRequestSearchForm
from people.models import Person
from people.forms import PersonForm
from rest_framework import filters, permissions, viewsets


class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.all()
    search_fields = ['address', 'city', 'animal__name', 'owner__first_name', 'owner__last_name', 'owner__address', 'owner__city', 'reporter__first_name', 'reporter__last_name']
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = ServiceRequestSerializer

    # When creating, update any animals associated with the SR owner with the created service request.
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer = serializer.save()
            if serializer.owner:
                serializer.owner.animal_set.update(request=serializer.id)

    def get_queryset(self):
        queryset = ServiceRequest.objects.all()
        status = self.request.query_params.get('status', '')
        if status == 'open':
            queryset = queryset.filter(animal__status__in=['REPORTED', 'ASSIGNED']).distinct()
        elif status == 'closed':
            queryset = queryset.exclude(animal__status__in=['REPORTED', 'ASSIGNED']).distinct()
        return queryset
