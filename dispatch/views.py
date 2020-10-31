from django.http import JsonResponse
from datetime import datetime
from rest_framework import filters, permissions, viewsets

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
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = EvacAssignmentSerializer

    # When creating, update all service requests to be assigned status.
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()
            ServiceRequest.objects.filter(pk__in=serializer.data['service_requests']).update(status="assigned")