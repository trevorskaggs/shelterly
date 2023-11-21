import re

from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.conf import settings

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):

    display_phone = serializers.SerializerMethodField()
    version = serializers.SerializerMethodField()
    user_perms = serializers.SerializerMethodField()
    incident_perms = serializers.SerializerMethodField()
    email_notification = serializers.SerializerMethodField()

    # Custom field for Formated Phone Number
    def get_display_phone(self, obj):
        return re.sub(r'(\d{3})(\d{3})(\d{4})(.*)', r'(\1) \2-\3 \4', obj.cell_phone.replace(' ', ''))

    # Custom field for Shelterly version
    def get_version(self, obj):
        return settings.SHELTERLY_VERSION

    # Custom field for user perms
    def get_user_perms(self, obj):
        # TODO tie these to current org
        # import ipdb;ipdb.set_trace()
        return True

    # Custom field for user perms
    def get_incident_perms(self, obj):
        return True

    # Custom field for user perms
    def get_email_notification(self, obj):
        return True

    class Meta:
        model = User
        fields = ('agency_id', 'cell_phone', 'first_name', 'id', 'last_name', 'username', 'email', 'is_superuser', 'display_phone', 'user_perms', 'incident_perms', 'email_notification', 'version')
