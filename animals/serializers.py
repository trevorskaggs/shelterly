from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from .models import Animal, Species
from location.utils import build_full_address, build_action_string
from people.serializers import SimplePersonSerializer
from shelter.serializers import SimpleShelterSerializer
from vet.models import Exam

class SpeciesSerializer(serializers.ModelSerializer):

    class Meta:
        model = Species
        fields = '__all__'


class SimpleAnimalSerializer(serializers.ModelSerializer):

    species_string = serializers.StringRelatedField(source='species', read_only=True)
    category = serializers.SerializerMethodField()

    def get_category(self, obj):
        if obj.species:
            return obj.species.category.name
        return ''

    class Meta:
        model = Animal
        fields = ['id', 'id_for_incident', 'species', 'species_string', 'category', 'aggressive', 'confined', 'injured', 'status', 'aco_required', 'name', 'sex', 'fixed', 'size', 'age', 'pcolor', 'scolor', 'last_seen', 'color_notes', 'behavior_notes', 'medical_notes']

class ModestAnimalSerializer(SimpleAnimalSerializer):
    front_image = serializers.SerializerMethodField()
    found_location = serializers.SerializerMethodField()
    request_id_for_incident = serializers.SerializerMethodField()
    request_address = serializers.SerializerMethodField()
    request_lat_lon = serializers.SerializerMethodField()
    weight = serializers.SerializerMethodField()
    owners = SimplePersonSerializer(many=True, required=False, read_only=True)
    owner_names = serializers.StringRelatedField(source='owners', many=True, read_only=True)
    shelter_object = SimpleShelterSerializer(source='shelter', required=False, read_only=True)
    room_name = serializers.StringRelatedField(source='room', read_only=True)

    class Meta:
        model = Animal
        fields = ['id', 'id_for_incident', 'name', 'species', 'species_string', 'aggressive', 'injured', 'fixed', 'request', 'request_id_for_incident', 'found_location', 'request_address', 'request_lat_lon', 'shelter_object', 'shelter', 'status', 'aco_required', 'color_notes',
        'microchip', 'front_image', 'owners', 'owner_names', 'sex', 'size', 'age', 'pcolor', 'scolor', 'medical_notes', 'medical_record', 'behavior_notes', 'room', 'room_name', 'category', 'latitude', 'longitude', 'weight']

    def get_found_location(self, obj):
        return build_full_address(obj)

    def get_request_lat_lon(self, obj):
        if obj.request:
          return [obj.request.latitude, obj.request.longitude]
        return None

    def get_request_id_for_incident(self, obj):
        if obj.request:
          return obj.request.id_for_incident
        return ''

    # Custom field for request address.
    def get_request_address(self, obj):
        return build_full_address(obj.request)

    # Custom field for the current animal weight.
    def get_weight(self, obj):
        exams = Exam.objects.filter(medical_record__patient=obj)
        if exams:
            exam = exams.latest('open')
            text = '~' if exam.weight_estimated else ''
            return text + str(exam.weight) + exam.weight_unit
        return ''

    def get_front_image(self, obj):
        try:
            return [animal_image.image.url for animal_image in obj.images if animal_image.category == 'front_image'][0]
            # change this exception
        except IndexError:
            return ''
        except AttributeError:
            # Should only hit this when returning a single object after create.
            try:
                return obj.animalimage_set.filter(category='front_image').first().image.url
            except AttributeError:
                return ''

    def get_side_image(self, obj):
        try:
            return [animal_image.image.url for animal_image in obj.images if animal_image.category == 'side_image'][0]
        except IndexError:
            return ''
        except AttributeError:
            try:
                return obj.animalimage_set.filter(category='side_image').first().image.url
            except AttributeError:
                return ''

class AnimalSerializer(ModestAnimalSerializer):
    extra_images = serializers.SerializerMethodField()
    owners = SimplePersonSerializer(many=True, required=False, read_only=True)
    reporter_object = SimplePersonSerializer(source='reporter', read_only=True)
    action_history = serializers.SerializerMethodField()
    room_name = serializers.StringRelatedField(source='room', read_only=True)
    building_name = serializers.StringRelatedField(source='room.building', read_only=True)
    shelter_object = SimpleShelterSerializer(source='shelter', required=False, read_only=True)
    vet_requests = serializers.SerializerMethodField()

    class Meta:
        model = Animal
        fields = ['id', 'id_for_incident', 'species', 'species_string', 'status', 'aco_required', 'front_image', 'side_image', 'extra_images', 'last_seen', 'intake_date', 'address', 'city', 'state', 'zip_code',
        'aggressive', 'injured', 'fixed', 'confined', 'found_location', 'owner_names', 'owners', 'shelter_object', 'shelter', 'reporter', 'reporter_object', 'request', 'request_id_for_incident', 'request_address',
        'action_history', 'building_name', 'room', 'room_name', 'name', 'sex', 'size', 'age', 'pcolor', 'scolor', 'color_notes', 'behavior_notes', 'medical_notes',
        'latitude', 'longitude', 'medical_record', 'microchip', 'vet_requests']

    # Truncates latitude and longitude.
    def to_internal_value(self, data):
        if data.get('latitude') or data.get('longitude'):
            # remember old state
            _mutable = data._mutable
            data._mutable = True

            if data.get('latitude'):
                data['latitude'] = float("%.6f" % float(data.get('latitude')))
            if data.get('longitude'):
                data['longitude'] = float("%.6f" % float(data.get('longitude')))

            data._mutable = _mutable

        return super().to_internal_value(data)

    def get_vet_requests(self, obj):
        from vet.serializers import SimpleVetRequestSerializer
        if obj.medical_record:
            return SimpleVetRequestSerializer(obj.medical_record.vetrequest_set.all(), required=False, read_only=True, many=True).data
        return []

    # Custom Reporter object field that excludes animals to avoid a circular reference.
    def get_reporter_object(self, obj):
        if obj.reporter:
            return SimplePersonSerializer(obj.reporter).data
        return None

    def get_extra_images(self, obj):
        try:
            return [animal_image.image.url for animal_image in obj.images if animal_image.category == 'extra']
        except IndexError:
            return ''
        except AttributeError:
            # Should only hit this when returning a single object after create.
            try:
                return [animal_image.image.url for animal_image in obj.animalimage_set.filter(category='extra')]
            except AttributeError:
                return ''

    def get_action_history(self, obj):
        return [build_action_string(action) for action in obj.target_actions.all()]
