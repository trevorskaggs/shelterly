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
    team_name = serializers.SerializerMethodField()
    team_member_names = serializers.SerializerMethodField()
    dispatch_assignment = serializers.SerializerMethodField()

    def get_address(self, obj):
        if obj.assigned_request.first():
            return obj.assigned_request.first().service_request.location_output
        return None

    def get_dispatch_assignment(self, obj):
        if obj.assigned_request.first():
            return obj.assigned_request.first().dispatch_assignment.id
        return None

    def get_team_name(self, obj):
        # does this kick off another query?
        try:
            return obj.evac_assignment.team.name
        except AttributeError:
            return ''

    def get_team_member_names(self, obj):
        # does this kick off another query?
        try:
            return ", ".join([team_member['first_name'] + " " + team_member['last_name'] + (" (" + team_member['agency_id'] + ")") if team_member['agency_id'] else "" for team_member in obj.evac_assignment.team.team_members.all().values('first_name', 'last_name', 'agency_id')])
        except AttributeError:
            return ''

    class Meta:
        model = VisitNote
        fields = '__all__'

class SimpleServiceRequestSerializer(serializers.ModelSerializer):
    from people.serializers import SimplePersonSerializer

    full_address = serializers.SerializerMethodField()
    pending = serializers.BooleanField(read_only=True)
    animals = SimpleAnimalSerializer(many=True, required=False, read_only=True)
    # these method fields require animals queryset
    reported_animals = serializers.SerializerMethodField()
    sheltered_in_place = serializers.SerializerMethodField()
    unable_to_locate = serializers.SerializerMethodField()
    aco_required = serializers.SerializerMethodField(read_only=True)
    injured = serializers.BooleanField(read_only=True)
    animal_count = serializers.IntegerField(read_only=True)
    owner_objects = SimplePersonSerializer(source='owners', many=True, required=False, read_only=True)
    reporter_object = SimplePersonSerializer(source='reporter', required=False, read_only=True)
    evacuation_assignments = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRequest
        fields = ['id', 'latitude', 'longitude', 'full_address', 'followup_date', 'owners', 'address', 'city', 'state', 'zip_code', 'apartment', 'reporter', 'directions', 'evacuation_assignments', 'pending',
        'animal_count', 'key_provided', 'verbal_permission', 'injured', 'accessible', 'turn_around', 'animals', 'status', 'reported_animals', 'reporter_object', 'owner_objects', 'sheltered_in_place', 'unable_to_locate', 'aco_required']

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    def get_evacuation_assignments(self, obj):
        from evac.serializers import SimpleEvacAssignmentSerializer
        return SimpleEvacAssignmentSerializer(obj.evacuation_assignments, many=True, required=False, read_only=True).data

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

class ServiceRequestSerializer(SimpleServiceRequestSerializer):
    from people.serializers import SimplePersonSerializer

    action_history = serializers.SerializerMethodField()
    animal_count = serializers.IntegerField(read_only=True)
    injured = serializers.BooleanField(read_only=True)
    assigned_requests = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRequest
        fields = ['id', 'latitude', 'longitude', 'full_address', 'followup_date', 'status', 'address', 'city', 'state', 'zip_code',
        'injured', 'key_provided', 'verbal_permission', 'accessible', 'turn_around', 'animals', 'reported_animals', 'sheltered_in_place', 'unable_to_locate', 'aco_required',
        'animal_count', 'action_history', 'owner_objects', 'reporter_object', 'assigned_requests']

    def get_assigned_requests(self, obj):
        from evac.models import AssignedRequest
        from evac.serializers import AssignedRequestServiceRequestSerializer

        return AssignedRequestServiceRequestSerializer(AssignedRequest.objects.filter(service_request=obj), many=True, required=False, read_only=True).data

    # Custom field for the action history list.
    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]
