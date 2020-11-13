from django.http import JsonResponse
from datetime import datetime
from rest_framework import filters, permissions, viewsets
from actstream import action

from animals.models import Animal
from evac.models import EvacAssignment, EvacTeamMember, VisitNote
from evac.serializers import EvacAssignmentSerializer, EvacTeamMemberSerializer, VisitNoteSerializer
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
            evac_assignment = serializer.save()
            service_requests = ServiceRequest.objects.filter(pk__in=serializer.data['service_requests'])
            service_requests.update(status="assigned")
            action.send(self.request.user, verb='created evacuation assignment', target=evac_assignment)
            for service_request in service_requests:
                action.send(self.request.user, verb='assigned service request', target=service_request)

    def perform_update(self, serializer):
        if serializer.is_valid():
            serializer.validated_data['end_time'] = datetime.now()
            evac_assignment = serializer.save()
            for service_request in self.request.data['sr_updates']:
                sr_status = 'closed'
                for animal in service_request['animals']:
                    Animal.objects.filter(id=animal['id']).update(status=animal['status'])
                    if animal['status'] in ['SHELTERED IN PLACE', 'UNABLE TO LOCATE']:
                        sr_status = 'open'
                ServiceRequest.objects.filter(id=service_request['id']).update(status=sr_status, followup_date=service_request['followup_date'])
                # VisitNote.objects.create(evac_assignment=evac_assignment, service_request=service_request['id'], date_completed=service_request['date_completed'], notes=service_request['notes'], owner_contacted=service_request['owner_contacted'])
            action.send(self.request.user, verb='updated evacuation assignment', target=evac_assignment)

class VisitNoteViewSet(viewsets.ModelViewSet):

    queryset = VisitNote.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = VisitNoteSerializer
