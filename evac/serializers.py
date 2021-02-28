import re

from rest_framework import serializers
from actstream.models import target_stream

from animals.serializers import ModestAnimalSerializer
from evac.models import EvacAssignment, EvacTeamMember
from hotline.models import ServiceRequest
from hotline.serializers import SimpleServiceRequestSerializer, VisitNoteSerializer
from people.serializers import OwnerContactSerializer, SimplePersonSerializer

from location.utils import build_action_string

class EvacTeamMemberSerializer(serializers.ModelSerializer):
    
    display_name = serializers.SerializerMethodField()
    display_phone = serializers.SerializerMethodField()

    # Custome field for Name Output
    def get_display_name(self, obj):
        return '%s, %s' % (obj.last_name, obj.first_name)

    # Custom field for Formated Phone Number
    def get_display_phone(self, obj):
        return re.sub(r'(\d{3})(\d{3})(\d{4})', r'(\1) \2-\3', obj.phone)

    class Meta:
        model = EvacTeamMember
        fields = '__all__'

class DispatchServiceRequestSerializer(SimpleServiceRequestSerializer):
    animals = ModestAnimalSerializer(many=True, read_only=True)
    owner_contacts = OwnerContactSerializer(source='ownercontact_set', many=True, required=False, read_only=True)
    owner_objects = SimplePersonSerializer(source='owners', many=True, required=False, read_only=True)
    visit_notes = VisitNoteSerializer(source='visitnote_set', many=True, required=False, read_only=True)

    class Meta:
        model = ServiceRequest
        fields = ['id', 'latitude', 'longitude', 'full_address', 'followup_date',
        'injured', 'accessible', 'turn_around', 'animals', 'reported_animals', 'sheltered_in_place', 'unable_to_locate', 'aco_required',
        'owner_contacts', 'owner_objects', 'owners', 'visit_notes']


class EvacAssignmentSerializer(serializers.ModelSerializer):

    action_history = serializers.SerializerMethodField()
    team_member_objects = EvacTeamMemberSerializer(source='team_members', required=False, read_only=True, many=True)
    service_request_objects = DispatchServiceRequestSerializer(source='service_requests', required=False, read_only=True, many=True)

    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]

    class Meta:
        model = EvacAssignment
        fields = '__all__'
