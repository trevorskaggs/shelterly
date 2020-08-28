from rest_framework import serializers
from rest_framework.decorators import action
from .models import ServiceRequest
from animals.serializers import AnimalSerializer
from people.serializers import PersonSerializer
from location.utils import build_full_address

class ServiceRequestSerializer(serializers.ModelSerializer):
    owner_object = PersonSerializer(source='owner', required=False, read_only=True)
    reporter_object = PersonSerializer(source='reporter', required=False, read_only=True)
    full_address = serializers.SerializerMethodField()
    animals = AnimalSerializer(source='animal_set', many=True, required=False, read_only=True)

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    # Updates datetime fields to null when receiving an empty string submission.
    def to_internal_value(self, data):
        if data.get('recovery_time') == '':
            data['recovery_time'] = None
        if data.get('owner_notification_tstamp') == '':
            data['owner_notification_tstamp'] = None
        return super().to_internal_value(data)

    class Meta:
        model = ServiceRequest
        fields = '__all__'
