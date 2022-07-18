from rest_framework import serializers

from .models import Incident

class IncidentSerializer(serializers.ModelSerializer):

    def to_internal_value(self, data):
        # remember old state
        _mutable = data._mutable
        data._mutable = True

        # Make slug lowercase.
        if data.get('slug'):
            data['slug'] = data.get('slug').lower()
        # Truncates latitude and longitude.
        if data.get('latitude'):
            data['latitude'] = float("%.4f" % float(data.get('latitude')))
        if data.get('longitude'):
            data['longitude'] = float("%.4f" % float(data.get('longitude')))

        data._mutable = _mutable

        return super().to_internal_value(data)

    class Meta:
        model = Incident
        fields = '__all__'