from rest_framework import serializers
from rest_framework.decorators import action
from .models import ServiceRequest
from animals.serializers import AnimalSerializer
from people.serializers import PersonSerializer

class ServiceRequestSerializer(serializers.ModelSerializer):
    reporter_name = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()
    full_address = serializers.SerializerMethodField()
    animals = AnimalSerializer(source='animal_set', many=True, required=False)

    # Custom field for the owner name.
    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.first_name + " " + obj.owner.last_name
        return ""

    # Custom field for the reporter name.
    def get_reporter_name(self, obj):
        if obj.reporter:
            return obj.reporter.first_name + " " + obj.reporter.last_name
        return ""

    # Custom field for the full address.
    def get_full_address(self, obj):
        apartment = " " + obj.apartment + ", " if obj.apartment else ", "
        if obj.address:
            return obj.address + " " + apartment + obj.city + ", " + obj.state + " " + obj.zip_code
        return ""

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
