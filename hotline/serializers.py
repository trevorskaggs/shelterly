from rest_framework import serializers
from rest_framework.decorators import action
from .models import ServiceRequest
from people.models import Person
from people.serializers import PersonSerializer

class ServiceRequestSerializer(serializers.ModelSerializer):
    reporter_name = serializers.SerializerMethodField()
    owner_name = serializers.SerializerMethodField()

    def get_owner_name(self, obj):
        if obj.owner:
            return obj.owner.first_name + " " + obj.owner.last_name
        return ""

    def get_reporter_name(self, obj):
        if obj.reporter:
            return obj.reporter.first_name + " " + obj.reporter.last_name
        return ""

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not data['outcome']:
            data['outcome'] = ""
        if not data['owner_notification_notes']:
            data['owner_notification_notes'] = ""
        return data

    class Meta:
        model = ServiceRequest
        fields = '__all__'
