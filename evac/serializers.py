from datetime import datetime
from rest_framework import serializers
from evac.models import EvacAssignment, EvacTeamMember
from hotline.serializers import ServiceRequestSerializer

class EvacTeamMemberSerializer(serializers.ModelSerializer):
    
    display_name = serializers.SerializerMethodField()

    def get_display_name(self, obj):
        return '%s, %s' % (obj.last_name, obj.first_name)

    class Meta:
        model = EvacTeamMember
        fields = '__all__'

class EvacAssignmentSerializer(serializers.ModelSerializer):
    action_history = serializers.SerializerMethodField()

    def get_action_history(self, obj):
        return [str(action).replace(f'Shelter object ({obj.id})', '') for action in target_stream(obj)]

    class Meta:
        model = EvacAssignment
        fields = '__all__'
