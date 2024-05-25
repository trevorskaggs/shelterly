import re
from rest_framework import serializers
from actstream.models import target_stream

from .models import *
from location.utils import build_full_address, build_action_string
from animals.models import Animal

class IntakeSummarySerializer(serializers.ModelSerializer):

    animal_objects = serializers.SerializerMethodField()
    person_object = serializers.SerializerMethodField()
    shelter_name = serializers.StringRelatedField(source='shelter')

    def get_animal_objects(self, obj):
        from animals.serializers import AnimalSerializer
        return AnimalSerializer(obj.animals, many=True).data

    def get_person_object(self, obj):
        from people.serializers import PersonSerializer
        return PersonSerializer(obj.person, required=False, read_only=True).data

    class Meta:
        model = IntakeSummary
        fields = '__all__'


class SimpleRoomSerializer(serializers.ModelSerializer):
    animal_count = serializers.IntegerField(read_only=True)
    building_name = serializers.StringRelatedField(source='building')

    def get_building_name(self, obj):
        return obj.building.name


    class Meta:
        model = Room
        fields = '__all__'


class RoomSerializer(SimpleRoomSerializer):
    animals = serializers.SerializerMethodField()
    shelter = serializers.SerializerMethodField()
    shelter_name = serializers.SerializerMethodField()
    action_history = serializers.SerializerMethodField()

    def get_animals(self, obj):
        from animals.serializers import AnimalSerializer, ModestAnimalSerializer
        if 'shelter/api/shelter' in self.context['request'].path:
            # if this is a list of rooms for shelter/building endpoints, we have prefethed animals and 
            # only need simple serialization
            if hasattr(obj, 'animals'):
                return ModestAnimalSerializer(obj.animals, many=True, required=False, read_only=True).data
            else:
                return ModestAnimalSerializer(obj.animal_set.exclude(status='CANCELED'), many=True, required=False, read_only=True).data
        else:
            if hasattr(obj, 'animals'):
                return AnimalSerializer(obj.animals, many=True, required=False, read_only=True).data
            else:
                return AnimalSerializer(obj.animal_set.exclude(status='CANCELED'), many=True, required=False, read_only=True).data

    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]

    def get_shelter(self, obj):
        return obj.building.shelter.id

    def get_shelter_name(self, obj):
        return obj.building.shelter.name


class SimpleBuildingSerializer(serializers.ModelSerializer):
    shelter_name = serializers.StringRelatedField(source='shelter')
    rooms = SimpleRoomSerializer(source='room_set', many=True, required=False, read_only=True)
    action_history = serializers.SerializerMethodField()


    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]

    class Meta:
        model = Building
        fields = '__all__'


class BuildingSerializer(SimpleBuildingSerializer):
    animal_count = serializers.IntegerField(read_only=True)
    rooms = RoomSerializer(source='room_set', many=True, required=False, read_only=True)


class SimpleShelterSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()
    display_phone = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    # Custom field for Formated Phone Number
    def get_display_phone(self, obj):
        return re.sub(r'(\d{3})(\d{3})(\d{4})', r'(\1) \2-\3', obj.phone)

    class Meta:
        model = Shelter
        fields = '__all__'


class ModestShelterSerializer(SimpleShelterSerializer):
    
    buildings = SimpleBuildingSerializer(source='building_set', many=True, required=False, read_only=True)
    animal_count = serializers.IntegerField(required=False)
    room_count = serializers.IntegerField(required=False)
    unroomed_animals = serializers.SerializerMethodField()

    # Custom field for unroomed animals.
    def get_unroomed_animals(self, obj):
        from animals.serializers import ModestAnimalSerializer
        if hasattr(obj, 'unroomed_animals'):
            return ModestAnimalSerializer(obj.unroomed_animals, many=True).data
        else:
            return ModestAnimalSerializer(obj.animal_set.filter(room=None).exclude(status='CANCELED'), many=True, required=False, read_only=True).data


class ShelterSerializer(ModestShelterSerializer):
    #Single obj serializer
    buildings = BuildingSerializer(source='building_set', many=True, required=False, read_only=True)
    intake_summaries = IntakeSummarySerializer(source='intakesummary_set', many=True, required=False, read_only=True)
    # action_history = serializers.SerializerMethodField()

    # def get_action_history(self, obj):
    #     return [build_action_string(action) for action in obj.target_actions.all()]

    # Truncates latitude and longitude.
    def to_internal_value(self, data):
        if data.get('latitude'):
            data['latitude'] = float("%.6f" % float(data.get('latitude')))
        if data.get('longitude'):
            data['longitude'] = float("%.6f" % float(data.get('longitude')))
        return super().to_internal_value(data)
