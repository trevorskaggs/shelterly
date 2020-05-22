from rest_framework import serializers

from .models import Animal
from location.utils import build_full_address
from people.serializers import PersonSerializer

class AnimalSerializer(serializers.ModelSerializer):
    owner_object = PersonSerializer(source='owner', required=False, read_only=True)
    full_address = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        # Use the SR address if it exists.
        if obj.request and obj.request.address:
            return build_full_address(obj.request)
        # Otherwise use the owner address.
        return build_full_address(obj.owner)

    class Meta:
        model = Animal
        fields = '__all__'
