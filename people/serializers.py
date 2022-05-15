import re
from rest_framework import serializers
from animals.models import Animal
from .models import OwnerContact, Person
from location.utils import build_full_address, build_action_string
from hotline.models import ServiceRequest

class SimplePersonSerializer(serializers.ModelSerializer):

    full_address = serializers.SerializerMethodField()
    display_phone = serializers.SerializerMethodField()
    display_alt_phone = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    # Custom field for Formated Phone Number
    def get_display_phone(self, obj):
        return re.sub(r'(\d{3})(\d{3})(\d{4})', r'(\1) \2-\3', obj.phone)

    def get_is_owner(self, obj):
        try:
            return obj.is_sr_owner or obj.is_animal_owner
        except AttributeError:
            return ServiceRequest.objects.filter(owners=obj.id).exists() or Animal.objects.filter(owners=obj.id).exists()

    # Custom field for Formated Alt Phone Number
    def get_display_alt_phone(self, obj):
        return re.sub(r'(\d{3})(\d{3})(\d{4})', r'(\1) \2-\3', obj.alt_phone)

    # Truncates latitude and longitude.
    def to_internal_value(self, data):
        if data.get('latitude'):
            data['latitude'] = float("%.6f" % float(data.get('latitude')))
        if data.get('longitude'):
            data['longitude'] = float("%.6f" % float(data.get('longitude')))
        return super().to_internal_value(data)

    class Meta:
        model = Person
        fields = '__all__'


class OwnerContactSerializer(serializers.ModelSerializer):

    owner_name = serializers.SerializerMethodField()

    def get_owner_name(self, obj):
        if obj.owner:
            return str(obj.owner)
        return ''

    class Meta:
        model = OwnerContact
        fields = '__all__'


class PersonSerializer(SimplePersonSerializer):

    owner_contacts = OwnerContactSerializer(source='ownercontact_set', many=True, required=False, read_only=True)
    animals = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    request = serializers.SerializerMethodField()
    action_history = serializers.SerializerMethodField()

    def get_animals(self, obj):
        from animals.serializers import ModestAnimalSerializer
        if hasattr(obj, 'reporter_animals') and obj.reporter_animals.all():
            return ModestAnimalSerializer(obj.reporter_animals.exclude(status='CANCELED'), many=True).data
        else:
            if hasattr(obj, 'animals'):
                return ModestAnimalSerializer(obj.animals, many=True).data
            else:
                return ModestAnimalSerializer(obj.animal_set.exclude(status='CANCELED'), many=True).data

    def get_images(self, obj):
        try:
            return [{'url':sr_image.image.url, 'name':sr_image.name} for sr_image in obj.images]
        except IndexError:
            return []
        except AttributeError:
            # Should only hit this when returning a single object after create.
            try:
                return [{'url':sr_image.image.url, 'name':sr_image.name} for sr_image in obj.personimage_set.all()]
            except AttributeError:
                return []

    # Custom field for the action history.
    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]

    # Custom field for the ServiceRequest ID.
    def get_request(self, obj):
        from hotline.serializers import BarebonesServiceRequestSerializer
        if obj.reporter_service_request.all():
            service_request = obj.reporter_service_request.all()[0]
        elif obj.request.all():
            service_request = obj.request.all()[0]
        else:
            service_request = None
        if service_request:
            return BarebonesServiceRequestSerializer(service_request).data
        else:
            return None
