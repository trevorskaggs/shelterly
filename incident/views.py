from datetime import datetime
from rest_framework import permissions, viewsets

from incident.models import Incident
from incident.serializers import IncidentSerializer


# Provides view for User API calls.
class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = IncidentSerializer

    def get_queryset(self):
        queryset = Incident.objects.all()

        if self.request.GET.get('incident_slug'):
            queryset = queryset.filter(slug=self.request.GET.get('incident_slug'))

        return queryset

    def perform_create(self, serializer):
        if serializer.is_valid():
            # Only create incident if user is an Admin.
            if self.request.user.is_staff:
                serializer.save()

    def perform_update(self, serializer):
        if serializer.is_valid():

            # Only create incident if user is an Admin.
            if self.request.user.is_staff:
                incident = serializer.save()

                # Open/close incident.
                if self.request.data.get('change_lock'):
                    if incident.end_time:
                        incident.end_time = None
                    else:
                        incident.end_time = datetime.now()
                    incident.save()
