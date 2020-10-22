from django.db.models import Q
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
    aco_required = serializers.SerializerMethodField()
    animal_count = serializers.IntegerField(read_only=True)
    injured = serializers.BooleanField(read_only=True)
    action_history = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    def get_action_history(self, obj):
        return [str(action).replace(f'ServiceRequest object ({obj.id})', '') for action in target_stream(obj)]

    # Custom field for if any animal is ACO Required. If it is aggressive or "Other" species.
    def get_aco_required(self, obj):
        return obj.animal_set.filter(Q(aggressive='yes') | Q(species='other')).exists()

    # Updates datetime fields to null when receiving an empty string submission.
    # Truncates latitude and longitude.
    def to_internal_value(self, data):
        if data.get('recovery_time') == '':
            data['recovery_time'] = None
        if data.get('owner_notification_tstamp') == '':
            data['owner_notification_tstamp'] = None
        if data.get('latitude'):
            data['latitude'] = float("%.6f" % float(data.get('latitude')))
        if data.get('longitude'):
            data['longitude'] = float("%.6f" % float(data.get('longitude')))
        return super().to_internal_value(data)

    class Meta:
        model = ServiceRequest
        fields = '__all__'
