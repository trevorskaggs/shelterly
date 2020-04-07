from rest_framework import serializers
from .models import *

class ShelterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shelter
        fields = '__all__'

class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = (
            'name',
            'shelter',
            'description',
        )

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = (
            'name',
            'shelter',
            'building',
            'description',
        )