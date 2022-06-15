from rest_framework import generics, permissions, viewsets

from incident.models import Incident
from incident.serializers import IncidentSerializer


# Provides view for User API calls.
class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = IncidentSerializer
