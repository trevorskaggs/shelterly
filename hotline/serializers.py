from rest_framework import serializers
from rest_framework.decorators import action
from .models import ServiceRequest
from people.models import Person
from people.serializers import PersonSerializer

class ServiceRequestSerializer(serializers.ModelSerializer):
    reporter_name = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()

    def get_owner_name(self, obj):
        return obj.owner.first_name + " " + obj.owner.last_name

    def get_reporter_name(self, obj):
        return obj.reporter.first_name + " " + obj.reporter.last_name

    class Meta:
        model = ServiceRequest
        fields = '__all__'
