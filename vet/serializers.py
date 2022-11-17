from rest_framework import serializers

from .models import VetRequest

class VetRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = VetRequest
        fields = ['id', 'assignee__first_name', 'assignee__last_name', 'patient__shelter__name', 'patient__species', 'priority', 'open']

# class ModestAnimalSerializer(SimpleAnimalSerializer):
#     front_image = serializers.SerializerMethodField()
#     side_image = serializers.SerializerMethodField()
#     owner_names = serializers.StringRelatedField(source='owners', many=True, read_only=True)
#     shelter_object = SimpleShelterSerializer(source='shelter', required=False, read_only=True)

#     class Meta:
#         model = Animal
#         fields = ['id', 'name', 'species', 'aggressive', 'request', 'shelter_object', 'shelter', 'status', 'aco_required', 'color_notes',
#         'front_image', 'side_image', 'owner_names', 'sex', 'size', 'age', 'pcolor', 'scolor', 'medical_notes', 'behavior_notes']