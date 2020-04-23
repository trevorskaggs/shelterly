from rest_framework import serializers
from .models import ServiceRequest
from people.serializers import PersonObjectSerializer

class ServiceRequestSerializer(serializers.ModelSerializer):
    owner = PersonObjectSerializer()
    reporter = PersonObjectSerializer()

    class Meta:
        model = ServiceRequest
        fields = '__all__'
