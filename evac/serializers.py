from rest_framework import serializers
from .models import EvacTeam

class EvacTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvacTeam
        fields = '__all__'
