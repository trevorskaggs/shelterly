from datetime import datetime
from rest_framework import permissions, viewsets

from incident.models import Incident, Organization
from incident.serializers import IncidentSerializer, OrganizationSerializer


# Provides view for User API calls.
class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = IncidentSerializer

    def get_queryset(self):
        queryset = Incident.objects.all()

        if self.request.GET.get('incident'):
            queryset = queryset.filter(slug=self.request.GET.get('incident'))

        if self.request.GET.get('organization_slug'):
            queryset = queryset.filter(organization__slug=self.request.GET.get('organization_slug'))

        return queryset

    def perform_create(self, serializer):
        if serializer.is_valid():

            # Only create incident if user is an Admin.
            if self.request.user.is_superuser or self.request.user.perms.filter(organization=self.request.data.get('organization'))[0].incident_perms:
                serializer.save()

    def perform_update(self, serializer):
        if serializer.is_valid():

            # Only create incident if user is an Admin.
            if self.request.user.is_superuser or self.request.user.perms.filter(organization=self.request.data.get('organization'))[0].incident_perms:
                incident = serializer.save()

                # Open/close incident.
                if self.request.data.get('change_lock'):
                    if incident.end_time:
                        incident.end_time = None
                    else:
                        incident.end_time = datetime.now()
                    incident.save()

# Provides view for User API calls.
class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        queryset = Organization.objects.filter(id__in=self.request.user.organizations.all())

        if self.request.GET.get('slug'):
            queryset = queryset.filter(slug=self.request.GET.get('slug'))

        return queryset
