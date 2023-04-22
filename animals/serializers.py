from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from .models import Animal
from location.utils import build_full_address, build_action_string
from people.serializers import SimplePersonSerializer
from shelter.serializers import SimpleShelterSerializer

class SimpleAnimalSerializer(serializers.ModelSerializer):

    class Meta:
        model = Animal
        fields = ['id', 'species', 'aggressive', 'status', 'aco_required', 'name', 'sex', 'size', 'age', 'pcolor', 'scolor', 'color_notes', 'behavior_notes', 'medical_notes']

class ModestAnimalSerializer(SimpleAnimalSerializer):
    front_image = serializers.SerializerMethodField()
    side_image = serializers.SerializerMethodField()
    owner_names = serializers.StringRelatedField(source='owners', many=True, read_only=True)
    shelter_object = SimpleShelterSerializer(source='shelter', required=False, read_only=True)

    class Meta:
        model = Animal
        fields = ['id', 'name', 'species', 'aggressive', 'injured', 'fixed', 'request', 'shelter_object', 'shelter', 'status', 'aco_required', 'color_notes',
        'front_image', 'side_image', 'owner_names', 'sex', 'size', 'age', 'pcolor', 'scolor', 'medical_notes', 'behavior_notes']

    def get_front_image(self, obj):
        try:
            return [animal_image.image.url for animal_image in obj.images if animal_image.category == 'front_image'][0]
            # change this exception
        except IndexError:
            return ''
        except AttributeError:
            # Should only hit this when returning a single object after create.
            try:
                return obj.animalimage_set.filter(category='front_image').first().image.url
            except AttributeError:
                return ''


    def get_side_image(self, obj):
        try:
            return [animal_image.image.url for animal_image in obj.images if animal_image.category == 'side_image'][0]
        except IndexError:
            return ''
        except AttributeError:
            try:
                return obj.animalimage_set.filter(category='side_image').first().image.url
            except AttributeError:
                return ''

class AnimalSerializer(ModestAnimalSerializer):
    extra_images = serializers.SerializerMethodField()
    found_location = serializers.SerializerMethodField()
    owners = SimplePersonSerializer(many=True, required=False, read_only=True)
    reporter_object = SimplePersonSerializer(source='reporter', read_only=True)
    request_address = serializers.SerializerMethodField()
    action_history = serializers.SerializerMethodField()
    room_name = serializers.StringRelatedField(source='room', read_only=True)
    building_name = serializers.StringRelatedField(source='room.building', read_only=True)
    shelter_object = SimpleShelterSerializer(source='shelter', required=False, read_only=True)

    class Meta:
        model = Animal
        fields = ['id', 'species', 'status', 'aco_required', 'front_image', 'side_image', 'extra_images', 'last_seen', 'intake_date', 'address', 'city', 'state', 'zip_code',
        'aggressive', 'injured', 'fixed', 'confined', 'found_location', 'owner_names', 'owners', 'shelter_object', 'shelter', 'reporter', 'reporter_object', 'request', 'request_address',
        'action_history', 'building_name', 'room', 'room_name', 'name', 'sex', 'size', 'age', 'pcolor', 'scolor', 'color_notes', 'behavior_notes', 'medical_notes',
        'latitude', 'longitude', 'microchip']

    # Truncates latitude and longitude.
    def to_internal_value(self, data):
        if data.get('latitude') or data.get('longitude'):
            # remember old state
            _mutable = data._mutable
            data._mutable = True

            if data.get('latitude'):
                data['latitude'] = float("%.6f" % float(data.get('latitude')))
            if data.get('longitude'):
                data['longitude'] = float("%.6f" % float(data.get('longitude')))

            data._mutable = _mutable

        return super().to_internal_value(data)

    def get_found_location(self, obj):
        return build_full_address(obj)

    # Custom field for request address.
    def get_request_address(self, obj):
        return build_full_address(obj.request)

    # Custom Reporter object field that excludes animals to avoid a circular reference.
    def get_reporter_object(self, obj):
        if obj.reporter:
            return SimplePersonSerializer(obj.reporter).data
        return None

    def get_extra_images(self, obj):
        try:
            return [animal_image.image.url for animal_image in obj.images if animal_image.category == 'extra']
        except IndexError:
            return ''
        except AttributeError:
            # Should only hit this when returning a single object after create.
            try:
                return [animal_image.image.url for animal_image in obj.animalimage_set.filter(category='extra')]
            except AttributeError:
                return ''

    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]
