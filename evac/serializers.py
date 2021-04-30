import re

from rest_framework import serializers
from actstream.models import target_stream

from animals.serializers import ModestAnimalSerializer
from evac.models import DispatchTeam, EvacAssignment, EvacTeamMember, AssignedRequest
from hotline.models import ServiceRequest, VisitNote
from hotline.serializers import SimpleServiceRequestSerializer, VisitNoteSerializer
from people.serializers import OwnerContactSerializer, SimplePersonSerializer

from location.utils import build_action_string

class EvacTeamMemberSerializer(serializers.ModelSerializer):

    display_name = serializers.SerializerMethodField()
    display_phone = serializers.SerializerMethodField()

    # Custom field for Name Output
    def get_display_name(self, obj):
        return '%s %s' % (obj.first_name, obj.last_name)

    # Custom field for Formated Phone Number
    def get_display_phone(self, obj):
        return re.sub(r'(\d{3})(\d{3})(\d{4})', r'(\1) \2-\3', obj.phone)

    class Meta:
        model = EvacTeamMember
        fields = '__all__'

class DispatchTeamSerializer(serializers.ModelSerializer):

    team_member_objects = EvacTeamMemberSerializer(source='team_members', required=False, read_only=True, many=True)
    display_name = serializers.SerializerMethodField()
    is_assigned = serializers.BooleanField(read_only=True)

    # Custome field for Name Output
    def get_display_name(self, obj):
        return ", ".join([team_member.first_name + " " + team_member.last_name for team_member in obj.team_members.all()])

    class Meta:
        model = DispatchTeam
        fields = '__all__'

class DispatchServiceRequestSerializer(SimpleServiceRequestSerializer):

    animals = ModestAnimalSerializer(source='animal_set', many=True, read_only=True)
    owner_contacts = OwnerContactSerializer(source='ownercontact_set', many=True, required=False, read_only=True)
    owner_objects = SimplePersonSerializer(source='owners', many=True, required=False, read_only=True)

    class Meta:
        model = ServiceRequest
        fields = ['id', 'latitude', 'longitude', 'full_address', 'followup_date', 'status',
        'injured', 'accessible', 'turn_around', 'animals', 'reported_animals', 'sheltered_in_place', 'unable_to_locate', 'aco_required',
        'owner_contacts', 'owner_objects', 'owners']

class AssignedRequestDispatchSerializer(serializers.ModelSerializer):

    service_request_object = DispatchServiceRequestSerializer(source='service_request', required=False, read_only=True)
    visit_note = VisitNoteSerializer(required=False, read_only=True)
    owner_contact = OwnerContactSerializer(required=False, read_only=True)
    previous_visit = serializers.SerializerMethodField()

    def get_previous_visit(self, obj):
        if VisitNote.objects.filter(assigned_request__service_request=obj.service_request).exclude(assigned_request=obj).exists():
            return VisitNoteSerializer(VisitNote.objects.filter(assigned_request__service_request=obj.service_request).exclude(assigned_request=obj).latest('date_completed')).data
        return None

    class Meta:
        model = AssignedRequest
        fields = '__all__'

class SimpleEvacAssignmentSerializer(serializers.ModelSerializer):

    team_name = serializers.SerializerMethodField()
    team_member_names = serializers.SerializerMethodField()

    def get_team_name(self, obj):
        # does this kick off another query?
        try:
            return obj.team.name
        except AttributeError:
            return ''

    def get_team_member_names(self, obj):
        # does this kick off another query?
        try:
            return ", ".join([team_member['first_name'] + " " + team_member['last_name'] + (" (" + team_member['agency_id'] + ")" if team_member['agency_id'] else "") for team_member in obj.team.team_members.all().values('first_name', 'last_name', 'agency_id')])
        except AttributeError:
            return ''

    class Meta:
        model = EvacAssignment
        fields = ['id', 'start_time', 'end_time', 'team_name', 'team_member_names']

class AssignedRequestServiceRequestSerializer(serializers.ModelSerializer):

    dispatch_assignment = SimpleEvacAssignmentSerializer(required=False, read_only=True)
    visit_note = VisitNoteSerializer(required=False, read_only=True)
    owner_contact = OwnerContactSerializer(required=False, read_only=True)

    class Meta:
        model = AssignedRequest
        fields = '__all__'

class EvacAssignmentSerializer(SimpleEvacAssignmentSerializer):

    team_object = DispatchTeamSerializer(source='team', required=False, read_only=True)
    assigned_requests = serializers.SerializerMethodField()

    def get_assigned_requests(self, obj):
        return AssignedRequestDispatchSerializer(AssignedRequest.objects.filter(dispatch_assignment=obj), many=True, required=False, read_only=True).data

    class Meta:
        model = EvacAssignment
        fields = '__all__'
