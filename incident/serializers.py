from rest_framework import serializers

from .models import Incident

class IncidentSerializer(serializers.ModelSerializer):

    def to_internal_value(self, data):
        # Make slug lowercase.
        if data.get('slug'):
            data['slug'] = data.get('slug').lower()
        # Truncates latitude and longitude.
        if data.get('latitude'):
            data['latitude'] = float("%.6f" % float(data.get('latitude')))
        if data.get('longitude'):
            data['longitude'] = float("%.6f" % float(data.get('longitude')))
        return super().to_internal_value(data)

    class Meta:
        model = Incident
        fields = '__all__'