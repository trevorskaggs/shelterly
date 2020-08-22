from rest_framework import serializers
from .models import EvacTeam

class EvacTeamSerializer(serializers.ModelSerializer):
    evac_team_member_names = serializers.SerializerMethodField()

    def get_evac_team_member_names(self, instance):
        names = []
        for team_member in instance.evac_team_members.get_queryset():
            names.append(team_member.first_name + " " + team_member.last_name)
        return ', '.join(names)

    class Meta:
        model = EvacTeam
        fields = ('id', 'evac_team_members', 'evac_team_member_names')
