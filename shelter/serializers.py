from rest_framework import serializers

from actstream.models import target_stream

from .models import *
from location.utils import build_full_address, build_action_string
from animals.models import Animal
from animals.serializers import AnimalSerializer

class RoomSerializer(serializers.ModelSerializer):
    animals = AnimalSerializer(source='animal_set', many=True, required=False, read_only=True)
    shelter = serializers.SerializerMethodField()
    shelter_name = serializers.SerializerMethodField()
    building_name = serializers.SerializerMethodField()
    action_history = serializers.SerializerMethodField()

    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]

    def get_shelter(self, obj):
        return obj.building.shelter.id

    def get_shelter_name(self, obj):
        return obj.building.shelter.name

    def get_building_name(self, obj):
        return obj.building.name

    class Meta:
        model = Room
        fields = '__all__'

class BuildingSerializer(serializers.ModelSerializer):
    shelter_name = serializers.SerializerMethodField()
    animal_count = serializers.SerializerMethodField()
    rooms = RoomSerializer(source='room_set', many=True, required=False, read_only=True)
    action_history = serializers.SerializerMethodField()

    # Custom field for the shelter name.
    def get_shelter_name(self, obj):
        return obj.shelter.name

    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]

    # Custom field for total animals.
    def get_animal_count(self, obj):
        return Animal.objects.filter(room__in=obj.room_set.all()).count()

    class Meta:
        model = Building
        fields = (
            'id',
            'name',
            'shelter',
            'shelter_name',
            'animal_count',
            'description',
            'rooms',
            'action_history'
        )

class ShelterSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()
    animal_count = serializers.SerializerMethodField()
    room_count = serializers.SerializerMethodField()
    buildings = BuildingSerializer(source='building_set', many=True, required=False, read_only=True)
    action_history = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]
    # Custom field for total animals.
    def get_animal_count(self, obj):
        return Animal.objects.filter(room__building__in=obj.building_set.all()).count()

    # Custom field for total rooms.
    def get_room_count(self, obj):
        return Room.objects.filter(building__in=obj.building_set.all()).count()

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
