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

    class Meta:
        model = EvacAssignment
        fields = '__all__'