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

    team_members = EvacTeamMemberSerializer(source='evacteammember_set', many=True, required=True)
    service_requests =ServiceRequestSerializer(source='servicerequest_set', many=True, required=True)
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()

    class Meta:
        model = EvacAssignment
        fields = '__all__'