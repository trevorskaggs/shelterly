from django.http import JsonResponse
from datetime import datetime
from rest_framework import filters, permissions, viewsets
from actstream import action

from evac.models import EvacAssignment, EvacTeamMember
from evac.serializers import EvacAssignmentSerializer, EvacTeamMemberSerializer
from hotline.models import ServiceRequest

class EvacTeamMemberViewSet(viewsets.ModelViewSet):

    queryset = EvacTeamMember.objects.all()
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = EvacTeamMemberSerializer

class EvacAssignmentViewSet(viewsets.ModelViewSet):

    queryset = EvacAssignment.objects.all()
    search_fields = ['team_members__first_name', 'team_members__last_name', 'service_requests__owner__first_name', 'service_requests__owner__last_name', 'service_requests__address', 'service_requests__reporter__first_name', 'service_requests__reporter__last_name']
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = EvacAssignmentSerializer

    # When creating, update all service requests to be assigned status.
    def perform_create(self, serializer):
        if serializer.is_valid():
            evac_assignment = serializer.save()
            service_requests = ServiceRequest.objects.filter(pk__in=serializer.data['service_requests'])
            service_requests.update(status="assigned")
            action.send(self.request.user, verb='created evacuation assignment', target=evac_assignment)
            for service_request in service_requests:
                action.send(self.request.user, verb='assigned service request', target=service_request)

    def get_queryset(self):
        queryset = EvacAssignment.objects.all()
        status = self.request.query_params.get('status', '')
        if status == "all":
            return queryset
        if status  == "open":
            return queryset.filter(end_time__isnull=True).distinct()
        elif status == "closed":
            return queryset.filter(end_time__isnull=False).distinct()
        return queryset