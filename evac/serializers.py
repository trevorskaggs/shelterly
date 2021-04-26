import re

from rest_framework import serializers
from actstream.models import target_stream

from animals.serializers import ModestAnimalSerializer
from evac.models import DispatchTeam, EvacAssignment, EvacTeamMember
from hotline.models import ServiceRequest
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
    animals = ModestAnimalSerializer(many=True, read_only=True)
    owner_contacts = OwnerContactSerializer(source='ownercontact_set', many=True, required=False, read_only=True)
    owner_objects = SimplePersonSerializer(source='owners', many=True, required=False, read_only=True)
    visit_notes = VisitNoteSerializer(source='visitnote_set', many=True, required=False, read_only=True)
    latest_evac = serializers.SerializerMethodField()

    def get_latest_evac(self, obj):
        #TODO
        assigned_evac = EvacAssignment.objects.filter(service_requests=obj, end_time__isnull=True).values('id', 'start_time', 'end_time').first()
        if assigned_evac:
            return assigned_evac
        return EvacAssignment.objects.filter(service_requests=obj, end_time__isnull=False).values('id', 'start_time', 'end_time').first()

    class Meta:
        model = ServiceRequest
        fields = ['id', 'latitude', 'longitude', 'full_address', 'followup_date', 'status', 'latest_evac',
        'injured', 'accessible', 'turn_around', 'animals', 'reported_animals', 'sheltered_in_place', 'unable_to_locate', 'aco_required',
        'owner_contacts', 'owner_objects', 'owners', 'visit_notes']

class SimpleEvacAssignmentSerializer(serializers.ModelSerializer):

    team_name = serializers.StringRelatedField(source='team')
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
            return ", ".join([team_member['first_name'] + " " + team_member['last_name'] for team_member in obj.team.team_members.all().values('first_name', 'last_name')])
        except AttributeError:
            return ''

    class Meta:
        model = EvacAssignment
        fields = ['id', 'start_time', 'end_time', 'team_name', 'team_member_names']

class EvacAssignmentSerializer(SimpleEvacAssignmentSerializer):

    # action_history = serializers.SerializerMethodField()
    team_object = DispatchTeamSerializer(source='team', required=False, read_only=True)
    service_request_objects = DispatchServiceRequestSerializer(source='service_requests', required=False, read_only=True, many=True)
    team_member_names = serializers.SerializerMethodField()

    def get_team_member_names(self, obj):
        # does this kick off another query?
        try:
            return ", ".join([team_member['first_name'] + " " + team_member['last_name'] for team_member in obj.team.team_members.all().values('first_name', 'last_name')])
        except AttributeError:
            return ''

    # def get_action_history(self, obj):
    #     return [build_action_string(action) for action in obj.target_actions.all()]

    class Meta:
        model = EvacAssignment
        fields = '__all__'
