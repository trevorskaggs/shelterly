from django.http import JsonResponse
from datetime import datetime
from rest_framework import filters, permissions, viewsets

from evac.models import EvacTeamMember
from evac.serializers import EvacTeamMemberSerializer

class EvacTeamMemberViewSet(viewsets.ModelViewSet):

    queryset = EvacTeamMember.objects.all()
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

def EvacTeamMemberSelectionList(request):

    json_data = {}

    for etm in EvacTeamMember.objects.all():
        json_data[etm.pk] = "%s, %s" % (etm.last_name, etm.first_name)

    return JsonResponse(json_data)