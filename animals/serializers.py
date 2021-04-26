from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from actstream.models import target_stream

from .models import Animal, AnimalImage
from location.utils import build_full_address, build_action_string
from people.serializers import SimplePersonSerializer
from shelter.serializers import SimpleShelterSerializer

class SimpleAnimalSerializer(serializers.ModelSerializer):
    aco_required = serializers.SerializerMethodField()
    owner_names = serializers.StringRelatedField(source='owner_objects')

    # An Animal is ACO Required if it is aggressive or "Other" species.
    def get_aco_required(self, obj):
        return (obj.aggressive or obj.species.other)

    class Meta:
        model = Animal
        fields = ['id', 'species', 'aggressive', 'status', 'aco_required', 'name', 'sex', 'size', 'age', 'pcolor', 'scolor', 'color_notes', 'owner_names']

class ModestAnimalSerializer(SimpleAnimalSerializer):
    evacuation_assignments = serializers.SerializerMethodField()

    def get_evacuation_assignments(self, obj):
        return [ea.id for ea in obj.evacuation_assignments.all()]

    class Meta:
        model = Animal
        fields = ['id', 'species', 'aggressive', 'request', 'shelter', 'status', 'aco_required', 'color_notes', 'evacuation_assignments']

class AnimalSerializer(SimpleAnimalSerializer):
    front_image = serializers.SerializerMethodField()
    side_image = serializers.SerializerMethodField()
    extra_images = serializers.SerializerMethodField()
    found_location = serializers.SerializerMethodField()
    owner_objects = SimplePersonSerializer(many=True)
    reporter_object = SimplePersonSerializer(source='reporter', read_only=True)
    request_address = serializers.SerializerMethodField()
    action_history = serializers.SerializerMethodField()
    room_name = serializers.StringRelatedField()
    shelter_object = SimpleShelterSerializer(source='shelter')

    class Meta:
        model = Animal
        fields = ['id', 'species', 'status', 'aco_required', 'front_image', 'side_image', 'extra_images', 'last_seen', 'intake_date', 'address', 'city', 'state', 'zip_code',
        'aggressive', 'injured', 'fixed', 'confined', 'found_location', 'owner_names', 'owner_objects', 'shelter_object', 'shelter', 'reporter_object', 'request', 'request_address',
        'action_history', 'evacuation_assignments', 'room', 'room_name', 'name', 'sex', 'size', 'age', 'pcolor', 'scolor', 'color_notes']
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

    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]

    def get_front_image(self, obj):
        try:
            return [animal_image.image.url for animal_image in obj.images if animal_image.category == 'front_image'][0]
            # change this exception
        except IndexError:
            return ''
        except AttributeError:
            # Should only hit this when returning a single object after create.
            try:
                return obj.animalimage_set.filter(category='front_image').first().url
            except AttributeError:
                return ''

    def get_side_image(self, obj):
        try:
            return [animal_image.image.url for animal_image in obj.images if animal_image.category == 'side_image'][0]
        except IndexError:
            return ''
        except AttributeError:
            try:
                return obj.animalimage_set.filter(category='side_image').first().url
            except AttributeError:
                return ''

    def get_extra_images(self, obj):
        try:
            return [animal_image.image.url for animal_image in obj.images if animal_image.category == 'extra'][0]
        except IndexError:
            return ''
        except AttributeError:
            # Should only hit this when returning a single object after create.
            try:
                return obj.animalimage_set.filter(category='extra').first().url
            except AttributeError:
                return ''
