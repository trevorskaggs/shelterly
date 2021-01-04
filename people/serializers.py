import re
from django.db.models import Count, Exists, OuterRef, Prefetch, Q
from rest_framework import serializers
from actstream.models import target_stream
from animals.models import Animal
from .models import Person
from location.utils import build_full_address, build_action_string
from hotline.models import ServiceRequest

class SimplePersonSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()
    display_phone = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    # Custom field for Formated Phone Number
    def get_display_phone(self, obj):
        return re.sub(r'(\d{3})(\d{3})(\d{4})', r'(\1) \2-\3', obj.phone)

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

class PersonSerializer(SimplePersonSerializer):
    from animals.serializers import AnimalSerializer
    animals = AnimalSerializer(many=True, required=False, read_only=True)
    request = serializers.SerializerMethodField()
    action_history = serializers.SerializerMethodField()


    # Custom field for the action history.
    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]


    # Custom field for the ServiceRequest ID.
    def get_request(self, obj):
        from hotline.serializers import SimpleServiceRequestSerializer
        service_request = (
            ServiceRequest.objects.filter(Q(owner=obj.id) | Q(reporter=obj.id))
        .annotate(animal_count=Count("animal"))
        .annotate(
            injured=Exists(Animal.objects.filter(request_id=OuterRef("id"), injured="yes"))
        )
        .prefetch_related(Prefetch('animal_set', queryset=Animal.objects.prefetch_related(Prefetch('animalimage_set', to_attr='images')), to_attr='animals'))
        .prefetch_related('target_actions')
        .prefetch_related('owner')
        .prefetch_related('visitnote_set')
        .select_related('reporter')
        .prefetch_related('evacuation_assignments')
        ).first()
        if service_request:
            return SimpleServiceRequestSerializer(service_request).data
        return None