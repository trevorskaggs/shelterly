import re

from rest_framework import serializers
from actstream.models import target_stream

from animals.serializers import AnimalSerializer
from evac.models import DispatchTeam, EvacAssignment, EvacTeamMember
from hotline.serializers import ServiceRequestSerializer
from people.serializers import SimplePersonSerializer

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

class DispatchServiceRequestSerializer(ServiceRequestSerializer):

    animals = serializers.SerializerMethodField()

    def get_animals(self, obj):
        return AnimalSerializer(obj.animal_set.exclude(status="CANCELED"), many=True, read_only=True).data

class EvacAssignmentSerializer(serializers.ModelSerializer):

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
