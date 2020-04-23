from rest_framework import serializers
from .models import Person

class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = '__all__'

class ObjectSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Need empty string for loading
        return {key: ('' if data[key] is None else value) for key, value in data.items()}

class PersonObjectSerializer(ObjectSerializer):
    class Meta:
        model = Person
        fields = '__all__'
