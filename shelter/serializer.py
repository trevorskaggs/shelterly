from rest_framework import serializers
from .models import *
from location.utils import build_full_address
from actstream.models import target_stream

class RoomSerializer(serializers.ModelSerializer):
    action_history = serializers.SerializerMethodField()

    def get_action_history(self, obj):
        return [str(action).replace(f'Room object ({obj.id})', '') for action in target_stream(obj)]

    class Meta:
        model = Room
        fields = (
            'id',
            'building',
            'name',
            'description',
            'action_history'
        )

class BuildingSerializer(serializers.ModelSerializer):
    shelter_name = serializers.SerializerMethodField()
    rooms = RoomSerializer(source='room_set', many=True, required=False, read_only=True)
    action_history = serializers.SerializerMethodField()

    # Custom field for the shelter name.
    def get_shelter_name(self, obj):
        return obj.shelter.name

    def get_action_history(self, obj):
        return [str(action).replace(f'Building object ({obj.id})', '') for action in target_stream(obj)]

    class Meta:
        model = Building
        fields = (
            'id',
            'name',
            'shelter',
            'shelter_name',
            'description',
            'rooms',
            'action_history'
        )

class ShelterSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()
    buildings = BuildingSerializer(source='building_set', many=True, required=False, read_only=True)
    action_history = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    def get_action_history(self, obj):
        return [str(action).replace(f'Shelter object ({obj.id})', '') for action in target_stream(obj)]

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