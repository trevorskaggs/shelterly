from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from actstream.models import target_stream

from .models import Animal, AnimalImage
from location.utils import build_full_address, build_action_string

class AnimalSerializer(serializers.ModelSerializer):
    owner_object = serializers.SerializerMethodField()
    full_address = serializers.SerializerMethodField()
    aco_required = serializers.SerializerMethodField()
    front_image = serializers.SerializerMethodField()
    side_image = serializers.SerializerMethodField()
    extra_images = serializers.SerializerMethodField()
    action_history = serializers.SerializerMethodField()
    shelter_name = serializers.SerializerMethodField()
    shelter = serializers.SerializerMethodField()

    # Custom Owner object field that excludes animals to avoid a circular reference.
    def get_owner_object(self, obj):
        from people.serializers import SimplePersonSerializer
        if obj.owner:
            return SimplePersonSerializer(obj.owner).data
        return None

    # Custom field for the full address.
    def get_full_address(self, obj):
        # Use the Room address first if it exists.
        if obj.room:
            return build_full_address(obj.room.building.shelter)
        # Then use the SR address if it exists.
        elif obj.request:
            return build_full_address(obj.request)
        # Otherwise use the owner address.
        return build_full_address(obj.owner)

    # Custom field to return shelter ID.
    def get_shelter(self, obj):
        if obj.room:
            return obj.room.building.shelter.id
        return None

    # Custom field to return the shelter name.
    def get_shelter_name(self, obj):
        if obj.room:
            return obj.room.building.shelter.name
        return ''

    # An Animal is ACO Required if it is aggressive or "Other" species.
    def get_aco_required(self, obj):
        return (obj.aggressive or obj.species.other)

    def get_action_history(self, obj):
        return [build_action_string(action) for action in target_stream(obj)]

    def get_front_image(self, obj):
        try:
            return AnimalImage.objects.get(animal=obj, category="front_image").image.url
        except ObjectDoesNotExist:
            return ''

    def get_side_image(self, obj):
        try:
            return AnimalImage.objects.get(animal=obj, category="side_image").image.url
        except ObjectDoesNotExist:
            return ''

    def get_extra_images(self, obj):
        return [animal_image.image.url for animal_image in AnimalImage.objects.filter(animal=obj, category="extra")]

    class Meta:
        model = Animal
        fields = '__all__'
