import re
from django.db.models import Count, Exists, OuterRef, Prefetch, Q
from rest_framework import serializers
from actstream.models import target_stream
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

        return str(obj.owner)

    class Meta:
        model = OwnerContact
        fields = '__all__'


class PersonSerializer(SimplePersonSerializer):

    owner_contacts = OwnerContactSerializer(source='ownercontact_set', many=True, required=False, read_only=True)
    animals = serializers.SerializerMethodField()
    request = serializers.SerializerMethodField()
    action_history = serializers.SerializerMethodField()

    def get_animals(self, obj):
        from animals.models import ModestAnimalSerializer
        return ModestAnimalSerializer(obj.animal_set.exclude(status='CANCELED') | obj.animals.exclude(status='CANCELED'), many=True).data

    # Custom field for the action history.
    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]

    # Custom field for the ServiceRequest ID.
    def get_request(self, obj):
        from hotline.serializers import SimpleServiceRequestSerializer
        service_request = (
            ServiceRequest.objects.filter(Q(owners=obj.id) | Q(reporter=obj.id))
        ).first()
        if service_request:
            return SimpleServiceRequestSerializer(service_request).data
        return None

