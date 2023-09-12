import re

from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.conf import settings

from accounts.models import Organization

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):

    display_phone = serializers.SerializerMethodField()
    version = serializers.SerializerMethodField()

    # Custom field for Formated Phone Number
    def get_display_phone(self, obj):
        return re.sub(r'(\d{3})(\d{3})(\d{4})(.*)', r'(\1) \2-\3 \4', obj.cell_phone.replace(' ', ''))

    # Custom field for Shelterly version
    def get_version(self, obj):
        return settings.SHELTERLY_VERSION

    class Meta:
        model = User
        fields = ('agency_id', 'cell_phone', 'first_name', 'id', 'last_name', 'username', 'email', 'is_superuser', 'display_phone', 'user_perms', 'incident_perms', 'email_notification', 'version')

class OrganizationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Organization
        fields = '__all__'
