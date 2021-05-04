import re
from rest_framework import serializers
from actstream.models import target_stream

from .models import *
from location.utils import build_full_address, build_action_string
from animals.models import Animal

class SimpleRoomSerializer(serializers.ModelSerializer):
    animal_count = serializers.SerializerMethodField()
    building_name = serializers.StringRelatedField(source='building')


    def get_building_name(self, obj):
        return obj.building.name

    def get_animal_count(self, obj):
        return len(obj.animals)

    class Meta:
        model = Room
        fields = ['id', 'name', 'description', 'animal_count', 'building_name']

class RoomSerializer(SimpleRoomSerializer):
    animals = serializers.SerializerMethodField()
    shelter = serializers.PrimaryKeyRelatedField(source="building.shelter", read_only=True)
    shelter_name = serializers.StringRelatedField(source="building.shelter")
    action_history = serializers.SerializerMethodField()

    def get_animals(self, obj):
        from animals.serializers import ModestAnimalSerializer
        return ModestAnimalSerializer(obj.animals, many=True, required=False, read_only=True).data

    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]

    class Meta:
        model = Room
        fields = ['id', 'name', 'description', 'animal_count', 'building_name','animals','shelter','shelter_name','action_history']

class SimpleBuildingSerializer(serializers.ModelSerializer):
    shelter_name = serializers.SerializerMethodField()
    rooms = SimpleRoomSerializer(many=True, required=False, read_only=True)
    action_history = serializers.SerializerMethodField()

    # Custom field for the shelter name.
    def get_shelter_name(self, obj):
        return obj.shelter.name

    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]

    class Meta:
        model = Building
        fields = '__all__'

class BuildingSerializer(SimpleBuildingSerializer):
    animal_count = serializers.SerializerMethodField()
    rooms = RoomSerializer(source='room_set', many=True, required=False, read_only=True)

    # Custom field for total animals.
    def get_animal_count(self, obj):
        return Animal.objects.filter(room__in=obj.room_set.all()).exclude(status='CANCELED').count()

class SimpleShelterSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()
    animal_count = serializers.SerializerMethodField()
    room_count = serializers.SerializerMethodField()
    display_phone = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    def get_room_count(self, obj):
        return Room.objects.filter(building__in=obj.building_set.all()).count()

    # Custom field for Formated Phone Number
    def get_display_phone(self, obj):
        return re.sub(r'(\d{3})(\d{3})(\d{4})', r'(\1) \2-\3', obj.phone)

    # Custom field for total animals.
    def get_animal_count(self, obj):
        return obj.animal_set.exclude(status='CANCELED').count()

    class Meta:
        model = Shelter
        fields = '__all__'

class ModestShelterSerializer(SimpleShelterSerializer):
    buildings = SimpleBuildingSerializer(source='building_set', many=True, required=False, read_only=True)

class ShelterSerializer(ModestShelterSerializer):
    unroomed_animals = serializers.SerializerMethodField()
    buildings = BuildingSerializer(source='building_set', many=True, required=False, read_only=True)
    action_history = serializers.SerializerMethodField()

    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]

    # Custom field for total animals.
    def get_unroomed_animals(self, obj):
        from animals.serializers import SimpleAnimalSerializer
        return SimpleAnimalSerializer(obj.animal_set.filter(room=None).exclude(status='CANCELED'), many=True).data

    # Truncates latitude and longitude.
    def to_internal_value(self, data):
        if data.get('latitude'):
            data['latitude'] = float("%.6f" % float(data.get('latitude')))
        if data.get('longitude'):
            data['longitude'] = float("%.6f" % float(data.get('longitude')))
        return super().to_internal_value(data)
