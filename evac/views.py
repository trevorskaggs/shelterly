from datetime import datetime
from rest_framework import viewsets, permissions

from evac.models import EvacTeam
from evac.serializers import EvacTeamSerializer

# Provides view for EvacTeam API calls.
class EvacTeamViewSet(viewsets.ModelViewSet):
    queryset = EvacTeam.objects.filter(team_date=datetime.now().date())
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = EvacTeamSerializer
