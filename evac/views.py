from django.db import transaction
from django.db.models import Count, Exists, OuterRef, Prefetch, Q
from django.http import HttpResponse, JsonResponse
import json
import io
from copy import deepcopy
from wsgiref.util import FileWrapper
from datetime import datetime, timedelta
from rest_framework import filters, permissions, serializers, viewsets
from rest_framework.decorators import action as drf_action
from actstream import action
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from animals.models import Animal
from animals.views import MultipleFieldLookupMixin
from animals.serializers import AnimalSerializer
from evac.models import AssignedRequest, DispatchTeam, EvacAssignment, EvacTeamMember, email_on_creation
from evac.serializers import DispatchTeamSerializer, DeployEvacAssignmentSerializer, EvacAssignmentSerializer, MapEvacAssignmentSerializer, EvacTeamMemberSerializer
from hotline.models import ServiceRequest, VisitNote
from incident.models import Incident, Organization
from people.models import OwnerContact, Person

class EvacTeamMemberViewSet(viewsets.ModelViewSet):

    queryset = EvacTeamMember.objects.all()
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = EvacTeamMemberSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():
            # Clean phone fields.
            serializer.validated_data['phone'] = ''.join(char for char in serializer.validated_data.get('phone', '') if char.isdigit())
            serializer.save()

    def perform_update(self, serializer):

        if serializer.is_valid():
            # Show/hide from map selectors.
            show = True
            if self.request.data.get('action', '') == 'hide':
                show = False
            serializer.validated_data['show'] = show
            serializer.save()

    def get_queryset(self):
        queryset = EvacTeamMember.objects.all()
        if self.request.GET.get('training'):
            queryset = queryset.filter(incident__organization__slug=self.request.GET.get('organization'), incident__training=self.request.GET.get('training') == 'true')
        queryset = (queryset
        .annotate(is_assigned=Exists(EvacAssignment.objects.filter(team__team_members__id=OuterRef("id"), end_time=None, service_requests__isnull=False))))
        return queryset

class DispatchTeamViewSet(viewsets.ModelViewSet):

    queryset = DispatchTeam.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = DispatchTeamSerializer

    def get_queryset(self):
        queryset = DispatchTeam.objects.all().annotate(is_assigned=Exists(EvacAssignment.objects.filter(team_id=OuterRef("id"), end_time=None, service_requests__isnull=False, incident__slug=self.request.GET.get('incident')))).order_by('-dispatch_date')
        is_map = self.request.query_params.get('map', '')
        if self.request.GET.get('incident'):
            queryset = queryset.filter(incident__slug=self.request.GET.get('incident'))

        if is_map == 'true':
            yesterday = datetime.today() - timedelta(days=1)
            y_mid = datetime.combine(yesterday,datetime.min.time())
            queryset = queryset.filter(Q(is_assigned=True) | Q(dispatch_date__gte=y_mid)).filter(team_members__show=True).distinct()

        return queryset

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save()

    def perform_update(self, serializer):

        if serializer.is_valid():
            # Show/hide from map selectors.
            if self.request.data.get('action', '') == 'show':
                serializer.validated_data['show'] = True
            elif self.request.data.get('action', '') == 'hide':
                serializer.validated_data['show'] = False

            team = serializer.save()

            # Add Team Members to DA.
            if self.request.data.get('new_team_members'):
                # if team length was 0, set AssignedRequest timestamp
                if team.team_members.count() == 0:
                    AssignedRequest.objects.filter(dispatch_assignment__team=team.id).update(timestamp=datetime.now())
                team.team_members.add(*self.request.data.get('new_team_members'))

            # Remove Team Member from DA.
            elif self.request.data.get('remove_team_member'):
                team.team_members.remove(self.request.data.get('remove_team_member'))

class EvacAssignmentViewSet(MultipleFieldLookupMixin, viewsets.ModelViewSet):

    queryset = EvacAssignment.objects.all()
    lookup_fields = ['pk', 'incident', 'id_for_incident']
    search_fields = ['team__name', 'team__team_members__first_name', 'team__team_members__last_name', 'service_requests__address', 'service_requests__city', 'service_requests__animal__name',]
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = EvacAssignmentSerializer
    deploy_serializer_class = DeployEvacAssignmentSerializer
    map_serializer_class = MapEvacAssignmentSerializer

    def get_serializer_class(self):
        if self.request.query_params.get('deploy_map', False):
            if hasattr(self, 'deploy_serializer_class'):
                return self.map_serializer_class
        elif self.request.query_params.get('map', False):
            if hasattr(self, 'map_serializer_class'):
                return self.map_serializer_class
        return super(EvacAssignmentViewSet, self).get_serializer_class()

    def get_queryset(self):
        queryset = EvacAssignment.objects.filter(service_requests__isnull=False, assigned_requests__isnull=False).distinct().order_by('-start_time').select_related('team').prefetch_related(Prefetch('service_requests',
                    ServiceRequest.objects
            .exclude(status='CANCELED')
            .annotate(
                injured=Exists(Animal.objects.filter(request_id=OuterRef("id"), injured="yes"))
            ).prefetch_related(Prefetch(
                'animal_set', queryset=Animal.objects.with_images().exclude(status='CANCELED'), to_attr='animals'))
            .prefetch_related(
                Prefetch('owners', queryset=Person.objects.annotate(
                    is_sr_owner=Exists(ServiceRequest.objects.filter(owners__id=OuterRef('id')))).annotate(
                    is_animal_owner=Exists(Animal.objects.filter(owners__id=OuterRef('id'))))))
            .select_related('reporter')
            # .prefetch_related('evacuation_assignments')
        )).prefetch_related(Prefetch('team', DispatchTeam.objects.prefetch_related('team_members'))).prefetch_related(Prefetch('assigned_requests',
        AssignedRequest.objects.select_related('service_request', 'owner_contact', 'visit_note').prefetch_related('service_request__owners', 'service_request__ownercontact_set',).prefetch_related(Prefetch(
                'service_request__animal_set', queryset=Animal.objects.exclude(status='CANCELED'), to_attr='animals'))))

        # Exclude DAs without SRs when fetching for a map.
        is_map = self.request.query_params.get('map', self.request.query_params.get('deploy_map', ''))
        if is_map == 'true':
            queryset = queryset.exclude(service_requests=None)

        if self.request.GET.get('incident'):
            queryset = queryset.filter(incident__slug=self.request.GET.get('incident'))

        status = self.request.query_params.get('status', '')
        if status == "open":
            return queryset.filter(end_time__isnull=True).distinct()
        elif status == "active":
            return queryset.filter(end_time__isnull=True).filter(team__team_members__isnull=False).distinct()
        elif status == "preplanned":
            return queryset.filter(end_time__isnull=True).filter(team__team_members__isnull=True).distinct()
        elif status == "resolved":
            return queryset.filter(end_time__isnull=False).distinct()

        return queryset

    # When creating, update all service requests to be assigned status.
    def perform_create(self, serializer):
        if serializer.is_valid():

            total_das = EvacAssignment.objects.select_for_update().filter(incident__slug=self.request.data.get('incident_slug')).values_list('id', flat=True)
            with transaction.atomic():
                count = len(total_das)
                serializer.validated_data['id_for_incident'] = count + 1

            timestamp = None
            if ServiceRequest.objects.filter(pk__in=self.request.data['service_requests'], status='assigned').exists():
                raise serializers.ValidationError(['Duplicate assigned service request error.', list(ServiceRequest.objects.filter(pk__in=self.request.data['service_requests'], status='assigned').values_list('id', flat=True))])
            team = DispatchTeam.objects.create(name=self.request.data.get('team_name'), incident=Incident.objects.get(pk=self.request.data.get('incident')))

            if self.request.data.get('team_members'):
                team.team_members.set(self.request.data.get('team_members'))
                timestamp = datetime.now()
            serializer.validated_data['team'] = team
            evac_assignment = serializer.save()
            service_requests = ServiceRequest.objects.filter(pk__in=self.request.data['service_requests'])
            service_requests.update(status="assigned")
            action.send(self.request.user, verb='created evacuation assignment', target=evac_assignment)
            for service_request in service_requests:
                action.send(self.request.user, verb='assigned service request', target=service_request)
                animals_dict = {}
                full_animal_set = AnimalSerializer(service_request.animal_set.all().filter(status__in=['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE']), many=True, required=False, read_only=True).data
                for animal in full_animal_set:
                    animals_dict[animal["id"]] = {
                        'id_for_incident':animal["id_for_incident"],
                        'animal_count':animal["animal_count"],
                        'status':animal["status"],
                        'name':animal["name"],
                        'species':animal["species_string"],
                        'color_notes':animal["color_notes"],
                        'pcolor':animal["pcolor"],
                        'scolor':animal["scolor"],
                        'shelter':'',
                        'room':'',
                        'animal_notes':animal["behavior_notes"],
                        'aggressive':animal["aggressive"],
                        'aco_required':animal["aco_required"],
                        'injured':animal["injured"],
                    }
                AssignedRequest.objects.create(dispatch_assignment=evac_assignment, service_request=service_request, animals=animals_dict, timestamp=timestamp)

            # Send email notification of creation.
            email_on_creation(evac_assignment)
            # Notify maps that there is updated data.
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)("map", {"type":"new_data"})

    def perform_update(self, serializer):
        if serializer.is_valid():
            # Only add end_time on first update if all SRs are complete.
            if not serializer.instance.end_time and self.request.data.get('closed'):
                serializer.validated_data['end_time'] = datetime.now()
            evac_assignment = serializer.save()

            # Add Service Request to DA if included.
            if self.request.data.get('new_service_request'):
                # Update SR status to assigned.
                service_requests = ServiceRequest.objects.filter(pk=self.request.data.get('new_service_request'))
                service_requests.update(status="assigned")
                # Remove SR from any existing open DA if applicable.
                old_da = EvacAssignment.objects.filter(service_requests=service_requests[0], end_time=None).first()
                if old_da:
                    old_da.service_requests.remove(service_requests[0])
                # Add SR to selected DA.
                animals_dict = {}
                full_animal_set = AnimalSerializer(service_requests[0].animal_set.filter(status__in=['REPORTED', 'REPORTED (EVAC REQUESTED)', 'REPORTED (SIP REQUESTED)', 'SHELTERED IN PLACE', 'UNABLE TO LOCATE']), many=True, required=False, read_only=True).data
                for animal in full_animal_set:
                    animals_dict[animal["id"]] = {
                        "id_for_incident": animal["id_for_incident"],
                        'animal_count':animal["animal_count"],
                        "name": animal["name"],
                        "species": animal["species_string"],
                        "status": animal["status"],
                        "color_notes": animal["color_notes"],
                        "pcolor": animal["pcolor"],
                        "scolor": animal["scolor"],
                        "shelter": animal["shelter"],
                        "room": animal["room"],
                        'animal_notes':animal["behavior_notes"],
                        'aggressive':animal["aggressive"],
                        'aco_required':animal["aco_required"],
                        'injured':animal["injured"],
                    }
                AssignedRequest.objects.create(dispatch_assignment=evac_assignment, service_request=service_requests[0], animals=animals_dict)
                action.send(self.request.user, verb='assigned service request', target=service_requests[0])

            for service_request in self.request.data.get('sr_updates', []):
                animals_dict = {}
                service_requests = ServiceRequest.objects.filter(id=service_request['id'])
                # sr_status = 'open' if service_request.get('unable_to_complete', '') else 'assigned'
                for animal_dict in service_request['animals']:
                    id = animal_dict["id"]
                    if id:
                      Animal.objects.filter(id=id).update(animal_count=animal_dict.get("animal_count"))
                      animals_dict[id] = {
                          "id_for_incident": animal_dict.get("id_for_incident"),
                          'animal_count':animal_dict.get("animal_count"),
                          "name": animal_dict.get("name"),
                          "species": animal_dict.get("species"),
                          "status": animal_dict.get("status"),
                          "color_notes": animal_dict.get("color_notes"),
                          "pcolor": animal_dict.get("pcolor"),
                          "scolor": animal_dict.get("scolor"),
                          "shelter": animal_dict.get("shelter"),
                          "room": animal_dict.get("room"),
                          'animal_notes':animal_dict.get("animal_notes"),
                          'aggressive':animal_dict.get("aggressive"),
                          'aco_required':animal_dict.get("aco_required"),
                          'injured':animal_dict.get("injured"),
                      }
                    else:
                        with transaction.atomic():
                            new_animal = deepcopy(Animal.objects.get(id=animal_dict["original_id"]))
                            new_animal.id = None
                            new_animal.medical_record = None
                            new_animal.animal_count = animal_dict["animal_count"]
                            new_animal.save()
                            id = new_animal.id
                            animals_dict[id] = {
                                "id_for_incident":new_animal.id_for_incident,
                                'animal_count':animal_dict["animal_count"],
                                "name":animal_dict.get("name"),
                                "species":animal_dict.get("species"),
                                "status":animal_dict.get("status"),
                                "color_notes":animal_dict.get("color_notes"),
                                "pcolor":animal_dict.get("pcolor"),
                                "scolor":animal_dict.get("scolor"),
                                "shelter":animal_dict.get("shelter"),
                                "room":animal_dict.get("room"),
                                'animal_notes':animal_dict.get("animal_notes"),
                                'aggressive':animal_dict.get("aggressive"),
                                'aco_required':animal_dict.get("aco_required"),
                                'injured':animal_dict.get("injured"),
                            }
                    # Record status change if applicable.
                    animal = Animal.objects.get(pk=id)
                    new_status = animal_dict.get('status')
                    if animal.status != new_status:
                        action.send(self.request.user, verb=f'changed animal status to {new_status}', target=animal)
                    new_shelter = animal_dict.get('shelter', None)
                    new_room = animal_dict.get('room', None)
                    if animal.shelter != new_shelter:
                        action.send(self.request.user, verb='sheltered animal', target=animal)
                        action.send(self.request.user, verb='sheltered animal', target=animal.shelter, action_object=animal)
                    intake_date = animal.intake_date if animal.intake_date else datetime.now()
                    # Update shelter, room, and intake_date info.
                    Animal.objects.filter(id=id).update(status=new_status, shelter=new_shelter, room=new_room, intake_date=intake_date)
                    # Update animal found location with SR location if blank.
                    if not animal.address:
                        Animal.objects.filter(id=id).update(address=service_requests[0].address, city=service_requests[0].city, state=service_requests[0].state, zip_code=service_requests[0].zip_code, latitude=service_requests[0].latitude, longitude=service_requests[0].longitude)

                # Update the relevant SR fields.
                assigned_request = AssignedRequest.objects.get(service_request=service_request['id'], dispatch_assignment=evac_assignment.id)
                # Update SIP/UTL.
                service_requests[0].update_sip_utl()
                assigned_request.animals = animals_dict

                # Only make these changes if saving a DAR Form.
                if self.request.data.get('start_time'):
                    # Only update SR with followup_date while DA is open or if the old AssignedRequest followup_date matches the current SR followup_date.
                    if not evac_assignment.end_time or (assigned_request.followup_date == service_requests[0].followup_date):
                        sr_followup_date = service_request['followup_date']
                    else:
                        sr_followup_date = service_requests[0].followup_date or None
                    assigned_request.followup_date = service_request['followup_date']

                    service_requests.update(followup_date=sr_followup_date, priority=service_request['priority'])
                    # Only create VisitNote on first update, otherwise update existing VisitNote.
                    if service_request.get('date_completed'):
                        if not assigned_request.visit_note:
                            visit_note = VisitNote.objects.create(date_completed=service_request['date_completed'], notes=service_request['notes'], forced_entry=service_request['forced_entry'])
                            assigned_request.visit_note = visit_note
                        else:
                            VisitNote.objects.filter(assigned_request=assigned_request).update(date_completed=service_request['date_completed'], notes=service_request.get('notes', ''), forced_entry=service_request.get('forced_entry', False))

                    # Create OwnerContact object if provided.
                    owner = Person.objects.get(pk=service_request['owner_contact_id']) if service_request.get('owner_contact_id') else None
                    owner_contact_time = service_request['owner_contact_time'] if service_request.get('owner_contact_time') else None
                    owner_contact_note = service_request['owner_contact_note'] if service_request.get('owner_contact_note') else ''
                    if owner or owner_contact_time or owner_contact_note:
                        # Only create OwnerContact on first update, otherwise update existing OwnerContact.
                        if not assigned_request.owner_contact:
                            owner_contact = OwnerContact.objects.create(owner=owner, owner_contact_note=service_request['owner_contact_note'], owner_contact_time=owner_contact_time)
                            assigned_request.owner_contact = owner_contact
                        else:
                            OwnerContact.objects.filter(assigned_request=assigned_request).update(owner=owner, owner_contact_note=service_request['owner_contact_note'], owner_contact_time=owner_contact_time)

                assigned_request.save()
                if service_request.get('unable_to_complete', False):
                    evac_assignment.service_requests.remove(service_requests[0])
                    evac_assignment.assigned_requests.remove(assigned_request)

                service_requests[0].update_status(self.request.user)

            action.send(self.request.user, verb='updated evacuation assignment', target=evac_assignment)

    @drf_action(detail=True, methods=['GET'], name='Download GeoJSON')
    def download(self, request, pk=None):
        ea = EvacAssignment.objects.get(id=pk)
        data = ea.get_geojson()
        data_string = json.dumps(data)
        json_file = io.StringIO()
        json_file.write(data_string)
        json_file.seek(0)

        wrapper = FileWrapper(json_file)
        response = HttpResponse(wrapper, content_type='application/json')
        response['Content-Disposition'] = 'attachement; filename=DAR-' + str(ea.id_for_incident) + '.geojson'
        return response

    @drf_action(detail=True, methods=['GET'], name='Push GeoJSON')
    def push(self, request, pk=None):
        ea = EvacAssignment.objects.get(id=pk)
        data = {}
        for sr in ea.service_requests.all():
            success = True
            try:
                sr.push_json()
            except:
                success = False
            data[sr.id] = {'status': success}
        return JsonResponse(data)
