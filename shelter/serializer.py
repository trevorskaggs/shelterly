from rest_framework import serializers
from .models import *
from location.utils import build_full_address


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = (
            'id',
            'shelter',
            'building',
            'name',
            'description',
        )

class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = (
            'id',
            'name',
            'shelter',
            'description',
        )

class ShelterSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()
    buildings = BuildingSerializer(source='building_set', many=True, required=False, read_only=True)
    rooms = RoomSerializer(source='room_set', many=True, required=False, read_only=True)
    
    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    class Meta:
        model = Shelter
        fields = '__all__'