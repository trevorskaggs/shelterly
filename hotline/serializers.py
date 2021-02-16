from django.db.models import Q
from rest_framework import serializers
from rest_framework.decorators import action

from .models import ServiceRequest, VisitNote
from animals.models import Animal
from animals.serializers import SimpleAnimalSerializer
from evac.models import EvacAssignment
from location.utils import build_full_address, build_action_string
from people.serializers import OwnerContactSerializer

class VisitNoteSerializer(serializers.ModelSerializer):

    address = serializers.SerializerMethodField()

    def get_address(self, obj):
        # does this kick off another query?
        return obj.service_request.location_output

    class Meta:
        model = VisitNote
        fields = '__all__'

class SimpleServiceRequestSerializer(serializers.ModelSerializer):

    full_address = serializers.SerializerMethodField()
    visit_notes = VisitNoteSerializer(source='visitnote_set', many=True, required=False, read_only=True)
    reported_animals = serializers.SerializerMethodField()
    owner_contacts = OwnerContactSerializer(source='ownercontact_set', many=True, required=False, read_only=True)
    sheltered_in_place = serializers.SerializerMethodField()
    unable_to_locate = serializers.SerializerMethodField()
    aco_required = serializers.SerializerMethodField(read_only=True)
    animal_count = serializers.IntegerField(read_only=True)
    injured = serializers.BooleanField(read_only=True)

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    # Custom field for the action history list.
    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]

    # Custom field for if any animal is ACO Required. If it is aggressive or "Other" species.
    def get_aco_required(self, obj):
        # Performs list comp. on prefetched queryset of animals for this SR to avoid hitting db again.
        try:
            return bool([animal for animal in obj.animals if animal.aggressive == 'yes' or animal.species == 'other'])
        except AttributeError:
            return obj.animal_set.filter(Q(aggressive='yes')|Q(species='other')).exists()

    # Custom field for determining if an SR contains REPORTED animals.
    def get_reported_animals(self, obj):
        # Performs list comp. on prefetched queryset of animals for this SR to avoid hitting db again.
        try:
            return len([animal for animal in obj.animals if animal.status == 'REPORTED'])
        except AttributeError:
            return obj.animal_set.filter(status='REPORTED').count()

    # Custom field for determining that count of SHELTERED IN PLACE animals.
    def get_sheltered_in_place(self, obj):
        # Performs list comp. on prefetched queryset of animals for this SR to avoid hitting db again.
        try:
            return len([animal for animal in obj.animals if animal.status == 'SHELTERED IN PLACE'])
        except AttributeError:
            return obj.animal_set.filter(status='SHELTERED IN PLACE').count()
    # Custom field for determining that count of UNABLE TO LOCATE animals.
    def get_unable_to_locate(self, obj):
        # Performs list comp. on prefetched queryset of animals for this SR to avoid hitting db again.
        try:
            return len([animal for animal in obj.animals if animal.status == 'UNABLE TO LOCATE'])
        except AttributeError:
            return obj.animal_set.filter(status='UNABLE TO LOCATE').count()

    # Custom field for the current open evac assignment if it exists.
    def get_assigned_evac(self, obj):
        from evac.models import EvacAssignment
        return EvacAssignment.objects.filter(service_requests=obj, end_time__isnull=True).values('id', 'start_time').first()

    def to_internal_value(self, data):
        # Updates datetime fields to null when receiving an empty string submission.
        for key in ['followup_date']:
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

class SimpleEvacAssignmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = EvacAssignment
        fields = ['id', 'start_time', 'end_time']


class ServiceRequestSerializer(SimpleServiceRequestSerializer):
    from people.serializers import SimplePersonSerializer

    action_history = serializers.SerializerMethodField()
    assigned_evac = serializers.SerializerMethodField()
    owner_objects = SimplePersonSerializer(source='owners', many=True, required=False, read_only=True)
    reporter_object = SimplePersonSerializer(source='reporter', required=False, read_only=True)
    animals = serializers.SerializerMethodField()
    evacuation_assignments = SimpleEvacAssignmentSerializer(many=True, required=False, read_only=True)

    def get_animals(self, obj):
        return SimpleAnimalSerializer(obj.animal_set.exclude(status="CANCELED"), many=True, read_only=True).data

    def __init__(self, *args, **kwargs):
    
        # Instantiate the superclass normally
        super(ServiceRequestSerializer, self).__init__(*args, **kwargs)
        if self.context.get('request') and self.context.get('request').path == '/hotline/api/servicerequests/':
            self.fields.pop('action_history')
