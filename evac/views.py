from datetime import datetime
from rest_framework import filters, permissions, viewsets

from evac.models import EvacTeamMember
from evac.serializers import EvacTeamMemberSerializer

class EvacTeamMemberViewSet(viewsets.ModelViewSet):

    queryset = EvacTeamMember.objects.all()
    search_fields = ['name',]
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = EvacTeamMemberSerializer

    def get_queryset(self):
        queryset = EvacTeamMember.objects.all()
        status = self.request.query_params.get('status', '')
        if status == 'open':
            queryset = queryset.filter(end_time__isnull=True).distinct()
        elif status == 'closed':
            queryset = queryset.filter(start_time__isnull=False, end_time__isnull=False).distinct()
        return queryset