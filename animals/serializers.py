from rest_framework import serializers
from rest_framework.decorators import action
from animals.models import Animal

class AnimalSerializer(serializers.ModelSerializer):

    class Meta:
        model = Animal
        fields = '__all__'
