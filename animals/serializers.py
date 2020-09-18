from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from .models import Animal, AnimalImage
from location.utils import build_full_address
from people.serializers import PersonSerializer

class AnimalSerializer(serializers.ModelSerializer):
    owner_object = PersonSerializer(source='owner', required=False, read_only=True)
    full_address = serializers.SerializerMethodField()
    aco_required = serializers.SerializerMethodField()
    front_image = serializers.SerializerMethodField()
    side_image = serializers.SerializerMethodField()
    extra_images = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        # Use the SR address if it exists.
        if obj.request and obj.request.address:
            return build_full_address(obj.request)
        # Otherwise use the owner address.
        return build_full_address(obj.owner)

    # An Animal is ACO Required if it is aggressive or "Other" species.
    def get_aco_required(self, obj):
        return (obj.aggressive or obj.species.other)

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
