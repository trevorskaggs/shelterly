from datetime import datetime
from rest_framework import serializers
from evac.models import EvacAssignment, EvacTeamMember
from hotline.serializers import ServiceRequestSerializer

class EvacTeamMemberSerializer(serializers.ModelSerializer):

    name = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()

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