from rest_framework import serializers
from .models import *
from location.utils import build_full_address
from animals.models import Animal
from animals.serializers import AnimalSerializer
from shelter.models import Room

class RoomSerializer(serializers.ModelSerializer):
    animals = AnimalSerializer(source='animal_set', many=True, required=False, read_only=True)
    shelter = serializers.SerializerMethodField()

    def get_shelter(self, obj):
        return obj.building.shelter.id

    class Meta:
        model = Room
        fields = (
            'id',
            'building',
            'name',
            'description',
            'animals',
            'shelter'
        )

class BuildingSerializer(serializers.ModelSerializer):
    shelter_name = serializers.SerializerMethodField()
    animal_count = serializers.SerializerMethodField()
    rooms = RoomSerializer(source='room_set', many=True, required=False, read_only=True)

    # Custom field for the shelter name.
    def get_shelter_name(self, obj):
        return obj.shelter.name

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
            'rooms'
        )

class ShelterSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()
    animal_count = serializers.SerializerMethodField()
    room_count = serializers.SerializerMethodField()
    buildings = BuildingSerializer(source='building_set', many=True, required=False, read_only=True)

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

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