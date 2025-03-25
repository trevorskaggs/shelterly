from rest_framework import serializers

from .models import ServiceRequest, ServiceRequestNote, VisitNote
from animals.serializers import SimpleAnimalSerializer, ModestAnimalSerializer, AnimalSerializer
from location.utils import build_full_address, build_action_string

class VisitNoteSerializer(serializers.ModelSerializer):

    address = serializers.SerializerMethodField()
    team_name = serializers.SerializerMethodField()
    team_member_names = serializers.SerializerMethodField()
    dispatch_assignment = serializers.SerializerMethodField()
    service_request = serializers.SerializerMethodField()

    def get_address(self, obj):
        if obj.assigned_request.first():
            return obj.assigned_request.first().service_request.location_output
        return None

    def get_dispatch_assignment(self, obj):
        if obj.assigned_request.first():
            return obj.assigned_request.first().dispatch_assignment.id_for_incident
        return None
    
    def get_service_request(self, obj):
        if obj.assigned_request.first():
            return obj.assigned_request.first().service_request.id_for_incident
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

class BarebonesServiceRequestSerializer(serializers.ModelSerializer):

    full_address = serializers.SerializerMethodField()
    animal_count = serializers.IntegerField(read_only=True)
    aco_required = serializers.SerializerMethodField(read_only=True)
    injured = serializers.BooleanField(read_only=True)

    # Custom field for if any animal is ACO Required. If it is aggressive or "Other" species.
    def get_aco_required(self, obj):
        # Performs list comp. on prefetched queryset of animals for this SR to avoid hitting db again.
        try:
            return bool([animal for animal in obj.animals if animal.aco_required == 'yes'])
        except AttributeError:
            return obj.animal_set.filter(aco_required='yes').exists()

    class Meta:
        model = ServiceRequest
        fields = ['id', 'id_for_incident', 'latitude', 'longitude', 'aco_required', 'followup_date', 'injured', 'accessible', 'turn_around', 'full_address', 'animal_count']

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

class MapServiceRequestSerializer(BarebonesServiceRequestSerializer):
    from people.serializers import SimplePersonSerializer

    full_address = serializers.SerializerMethodField()
    pending = serializers.BooleanField(read_only=True)
    animals = SimpleAnimalSerializer(many=True, required=False, read_only=True)
    owner_objects = SimplePersonSerializer(source='owners', many=True, required=False, read_only=True)
    # these method fields require animals queryset
    reported_animals = serializers.SerializerMethodField()
    reported_evac = serializers.SerializerMethodField()
    reported_sheltered_in_place = serializers.SerializerMethodField()
    sheltered_in_place = serializers.SerializerMethodField()
    unable_to_locate = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    # Custom field for determining if an SR contains REPORTED animals.
    def get_reported_animals(self, obj):
        # Performs list comp. on prefetched queryset of animals for this SR to avoid hitting db again.
        count = 0
        try:
            for animal in obj.animals:
                if animal.status == 'REPORTED':
                    count += animal.animal_count
            return count
        except AttributeError:
            for animal in obj.animal_set.filter(status='REPORTED'):
                count += animal.animal_count
            return count

    # Custom field for determining if an SR contains REPORTED (EVAC REQUESTED) animals.
    def get_reported_evac(self, obj):
        # Performs list comp. on prefetched queryset of animals for this SR to avoid hitting db again.
        count = 0
        try:
            for animal in obj.animals:
                if animal.status == 'REPORTED (EVAC REQUESTED)':
                    count += animal.animal_count
            return count
        except AttributeError:
            for animal in obj.animal_set.filter(status='REPORTED (EVAC REQUESTED)'):
                count += animal.animal_count
            return count

    # Custom field for determining that count of REPORTED (SIP REQUESTED) animals.
    def get_reported_sheltered_in_place(self, obj):
        # Performs list comp. on prefetched queryset of animals for this SR to avoid hitting db again.
        count = 0
        try:
            for animal in obj.animals:
                if animal.status == 'REPORTED (SIP REQUESTED)':
                    count += animal.animal_count
            return count
        except AttributeError:
            for animal in obj.animal_set.filter(status='REPORTED (SIP REQUESTED)'):
                count += animal.animal_count
            return count

    # Custom field for determining that count of SHELTERED IN PLACE animals.
    def get_sheltered_in_place(self, obj):
        # Performs list comp. on prefetched queryset of animals for this SR to avoid hitting db again.
        count = 0
        try:
            for animal in obj.animals:
                if animal.status == 'SHELTERED IN PLACE':
                    count += animal.animal_count
            return count
        except AttributeError:
            for animal in obj.animal_set.filter(status='SHELTERED IN PLACE'):
                count += animal.animal_count
            return count

    # Custom field for determining that count of UNABLE TO LOCATE animals.
    def get_unable_to_locate(self, obj):
        # Performs list comp. on prefetched queryset of animals for this SR to avoid hitting db again.
        count = 0
        try:
            for animal in obj.animals:
                if animal.status == 'UNABLE TO LOCATE':
                    count += animal.animal_count
            return count
        except AttributeError:
            for animal in obj.animal_set.filter(status='UNABLE TO LOCATE'):
                count += animal.animal_count
            return count

    class Meta:
        model = ServiceRequest
        fields = ['id', 'id_for_incident', 'timestamp', 'latitude', 'longitude', 'full_address', 'followup_date', 'address', 'city', 'state', 'zip_code', 'apartment', 'directions', 'priority', 'pending', 'owner_objects',
        'key_provided', 'verbal_permission', 'injured', 'accessible', 'turn_around', 'animals', 'status', 'reported_animals', 'reported_evac', 'reported_sheltered_in_place', 'sheltered_in_place', 'unable_to_locate', 'aco_required']


class SimpleServiceRequestSerializer(MapServiceRequestSerializer):
    from people.serializers import SimplePersonSerializer

    full_address = serializers.SerializerMethodField()
    pending = serializers.BooleanField(read_only=True)
    animals = SimpleAnimalSerializer(many=True, required=False, read_only=True)
    # these method fields require animals queryset
    reported_animals = serializers.SerializerMethodField()
    reported_evac = serializers.SerializerMethodField()
    reported_sheltered_in_place = serializers.SerializerMethodField()
    sheltered_in_place = serializers.SerializerMethodField()
    unable_to_locate = serializers.SerializerMethodField()
    aco_required = serializers.SerializerMethodField(read_only=True)
    injured = serializers.BooleanField(read_only=True)
    reporter_object = SimplePersonSerializer(source='reporter', required=False, read_only=True)
    evacuation_assignments = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRequest
        fields = ['id', 'id_for_incident', 'timestamp', 'latitude', 'longitude', 'full_address', 'followup_date', 'owners', 'reporter', 'address', 'city', 'state', 'zip_code', 'apartment', 'directions', 'priority', 'evacuation_assignments', 'pending',
        'images', 'key_provided', 'verbal_permission', 'injured', 'accessible', 'turn_around', 'animals', 'status', 'reported_animals', 'reported_evac', 'reporter_object', 'owner_objects', 'reported_sheltered_in_place', 'sheltered_in_place', 'unable_to_locate', 'aco_required']

    def get_evacuation_assignments(self, obj):
        from evac.serializers import SimpleEvacAssignmentSerializer
        return SimpleEvacAssignmentSerializer(obj.evacuation_assignments, many=True, required=False, read_only=True).data

    def get_images(self, obj):
        try:
            return [{'id':sr_image.id, 'url':sr_image.image.url, 'name':sr_image.name} for sr_image in obj.images]
        except IndexError:
            return []
        except AttributeError:
            # Should only hit this when returning a single object after create.
            try:
                return [{'id':sr_image.id, 'url':sr_image.image.url, 'name':sr_image.name} for sr_image in obj.servicerequestimage_set.all()]
            except AttributeError:
                return []

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


class ServiceRequestNoteSerializer(serializers.ModelSerializer):
    
    author_name = serializers.SerializerMethodField()

    def get_author_name(self, obj):
        return obj.author.first_name + ' ' + obj.author.last_name

    class Meta:
        model = ServiceRequestNote
        fields = '__all__'


class ServiceRequestSerializer(SimpleServiceRequestSerializer):

    action_history = serializers.SerializerMethodField()
    injured = serializers.BooleanField(read_only=True)
    assigned_requests = serializers.SerializerMethodField()
    animals = serializers.SerializerMethodField()
    notes = ServiceRequestNoteSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = ServiceRequest
        fields = ['id', 'id_for_incident', 'latitude', 'longitude', 'full_address', 'followup_date', 'status', 'address', 'city', 'state', 'zip_code', 'directions', 'priority',
        'injured', 'accessible', 'turn_around', 'animals', 'reporter', 'reported_animals', 'reported_evac', 'sheltered_in_place', 'reported_sheltered_in_place', 'unable_to_locate', 'aco_required',
        'images', 'key_provided', 'verbal_permission', 'action_history', 'owner_objects', 'reporter_object', 'assigned_requests', 'notes']

    # Custom field for ordering animals.
    def get_animals(self, obj):
        try:
            return AnimalSerializer(obj.animals.all().exclude(status='CANCELED').order_by('id'), many=True, required=False, read_only=True).data
        except AttributeError:
            return AnimalSerializer(obj.animal_set.all().exclude(status='CANCELED').order_by('id'), many=True, required=False, read_only=True).data

    def get_assigned_requests(self, obj):
        from evac.serializers import AssignedRequestServiceRequestSerializer

        return AssignedRequestServiceRequestSerializer(obj.assignedrequest_set.all(), many=True, required=False, read_only=True).data

    # Custom field for the action history list.
    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]
