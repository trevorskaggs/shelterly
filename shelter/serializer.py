from rest_framework import serializers
from .models import *
from location.utils import build_full_address


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = (
            'id',
            'building',
            'name',
            'description',
        )

class BuildingSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(source='room_set', many=True, required=False, read_only=True)

    class Meta:
        model = Building
        fields = (
            'id',
            'name',
            'shelter',
            'description',
            'rooms'
        )

class ShelterSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()
    buildings = BuildingSerializer(source='building_set', many=True, required=False, read_only=True)

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    # Truncates latitude and longitude.
    def to_internal_value(self, data):
        if data.get('latitude'):
            data['latitude'] = float("%.6f" % float(data.get('latitude')))
        if data.get('longitude'):
            data['longitude'] = float("%.6f" % float(data.get('longitude')))
        return super().to_internal_value(data)

    class Meta:
        model = Shelter
        fields = '__all__'