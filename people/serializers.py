from rest_framework import serializers
from .models import Person
from location.utils import build_full_address

class PersonSerializer(serializers.ModelSerializer):
    full_address = serializers.SerializerMethodField()
    action_history = serializers.SerializerMethodField()

    # Custom field for the full address.
    def get_full_address(self, obj):
        return build_full_address(obj)

    def get_action_history(self, obj):
        return [str(action).replace(f'Person object ({obj.id})', '') for action in target_stream(obj)]

    # Truncates latitude and longitude.
    def to_internal_value(self, data):
        if data.get('latitude'):
            data['latitude'] = float("%.6f" % float(data.get('latitude')))
        if data.get('longitude'):
            data['longitude'] = float("%.6f" % float(data.get('longitude')))
        return super().to_internal_value(data)

    class Meta:
        model = Person
        fields = '__all__'
