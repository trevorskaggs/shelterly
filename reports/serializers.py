from django.db.models import Count, Exists, OuterRef, Prefetch, Q
from django.db.models.functions import TruncDay, ExtractDay
from rest_framework import serializers

from .models import ServiceRequest, VisitNote
from animals.serializers import SimpleAnimalSerializer, ModestAnimalSerializer
from location.utils import build_full_address, build_action_string

class ReportSerializer(serializers.Serializer):

    days = serializers.SerializerMethodField()

    def get_days(self, obj):
        # import ipdb;ipdb.set_trace()
        days = ServiceRequest.objects.annotate(date=TruncDay('timestamp')).values('date').order_by('date').annotate(new_srs=Count("date")).values('date', 'new_srs')
        #values('timestamp', 'assignedrequest__timestamp')
        # EvacTeamMember.objects.all().annotate(is_assigned=Exists(EvacAssignment.objects.filter(team__team_members__id=OuterRef("id"), end_time=None)))
        # import ipdb;ipdb.set_trace()
        return days
