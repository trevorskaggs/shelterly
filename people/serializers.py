from rest_framework import serializers
from .models import Person
from location.utils import build_full_address

class PersonSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    class Meta:
        model = Person
        fields = '__all__'
