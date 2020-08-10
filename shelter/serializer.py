from rest_framework import serializers
from .models import *
from location.utils import build_full_address

class ShelterSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()
    
    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    class Meta:
        model = Shelter
        fields = '__all__'

class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = (
            'id',
            'name',
            'shelter',
            'description',
        )

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