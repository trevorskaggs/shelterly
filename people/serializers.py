from rest_framework import serializers
from .models import Person

class PersonSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        region = obj.city + ", " + obj.state + " " + obj.zip_code if obj.city else ""
        apartment = " " + obj.apartment + ", " if obj.apartment else ", " if region else ""
        if obj.address:
            return obj.address + apartment + region
        return ""

    class Meta:
        model = Person
        fields = '__all__'
