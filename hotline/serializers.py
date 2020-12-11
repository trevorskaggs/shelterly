from django.db.models import Q
from rest_framework import serializers
from rest_framework.decorators import action
from actstream.models import target_stream

from .models import ServiceRequest, VisitNote
from animals.models import Animal
from animals.serializers import AnimalSerializer
from location.utils import build_full_address, build_action_string

class VisitNoteSerializer(serializers.ModelSerializer):

    address = serializers.SerializerMethodField()

    def get_address(self, obj):
        return obj.service_request.location_output

    class Meta:
        model = VisitNote
        fields = '__all__'

class SimpleServiceRequestSerializer(serializers.ModelSerializer):

    full_address = serializers.SerializerMethodField()
    visit_notes = VisitNoteSerializer(source='visitnote_set', many=True, required=False, read_only=True)
    has_reported_animals = serializers.SerializerMethodField()
    sheltered_in_place = serializers.SerializerMethodField()
    unable_to_locate = serializers.SerializerMethodField()
    aco_required = serializers.SerializerMethodField()
    animal_count = serializers.IntegerField(read_only=True)
    injured = serializers.BooleanField(read_only=True)
    action_history = serializers.SerializerMethodField()
    assigned_evac = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    # Custom field for the action history list.
    def get_action_history(self, obj):
        return [build_action_string(action) for action in target_stream(obj)]

    # Custom field for if any animal is ACO Required. If it is aggressive or "Other" species.
    def get_aco_required(self, obj):
        return obj.animal_set.filter(Q(aggressive='yes') | Q(species='other')).exists()

    # Custom field for determining if an SR contains REPORTED animals.
    def get_has_reported_animals(self, obj):
        return Animal.objects.filter(request=obj, status='REPORTED').exists()

    # Custom field for determining that count of SHELTERED IN PLACE animals.
    def get_sheltered_in_place(self, obj):
        return Animal.objects.filter(request=obj, status='SHELTERED IN PLACE').count()

    # Custom field for determining that count of UNABLE TO LOCATE animals.
    def get_unable_to_locate(self, obj):
        return Animal.objects.filter(request=obj, status='UNABLE TO LOCATE').count()

    # Custom field for the current open evac assignment if it exists.
    def get_assigned_evac(self, obj):
        from evac.models import EvacAssignment
        return EvacAssignment.objects.filter(service_requests=obj, end_time__isnull=True).values_list('id', flat=True).first()

    def to_internal_value(self, data):
        # Updates datetime fields to null when receiving an empty string submission.
        for key in ['recovery_time', 'owner_notification_tstamp', 'followup_date']:
            if data.get(key) == '':
                data[key] = None

        # Truncates latitude and longitude.
        if data.get('latitude'):
            data['latitude'] = float("%.6f" % float(data.get('latitude')))
        if data.get('longitude'):
            data['longitude'] = float("%.6f" % float(data.get('longitude')))
        return super().to_internal_value(data)

    class Meta:
        model = ServiceRequest
        fields = '__all__'

class ServiceRequestSerializer(SimpleServiceRequestSerializer):
    from people.serializers import PersonSerializer

    owners = PersonSerializer(source='owner', many=True, required=False, read_only=True)
    reporter_object = PersonSerializer(source='reporter', required=False, read_only=True)
    animals = AnimalSerializer(source='animal_set', many=True, required=False, read_only=True)
