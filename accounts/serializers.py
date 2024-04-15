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
    vet_perms = serializers.SerializerMethodField()
    email_notification = serializers.SerializerMethodField()
    org_slugs = serializers.SerializerMethodField()

    # Custom field for Formated Phone Number
    def get_display_phone(self, obj):
        return re.sub(r'(\d{3})(\d{3})(\d{4})(.*)', r'(\1) \2-\3 \4', obj.cell_phone.replace(' ', ''))

    # Custom field for Shelterly version
    def get_version(self, obj):
        return settings.SHELTERLY_VERSION

    # Custom field for user perms
    def get_user_perms(self, obj):
        if self.context.get('request') and self.context['request'].GET.get('organization'):
            return obj.perms.filter(organization=self.context['request'].GET.get('organization'))[0].user_perms
        return False

    # Custom field for incident perms
    def get_incident_perms(self, obj):
        if self.context.get('request') and self.context['request'].GET.get('organization'):
            return obj.perms.filter(organization=self.context['request'].GET.get('organization'))[0].incident_perms
        return False

    # Custom field for user perms
    def get_vet_perms(self, obj):
        if self.context.get('request') and self.context['request'].GET.get('organization'):
            return obj.perms.filter(organization=self.context['request'].GET.get('organization'))[0].vet_perms
        return False

    # Custom field for user perms
    def get_email_notification(self, obj):
        if self.context.get('request') and self.context['request'].GET.get('organization'):
            return obj.perms.filter(organization=self.context['request'].GET.get('organization'))[0].email_notification
        return False

    def get_org_slugs(self, obj):
        return obj.organizations.all().values_list('slug', flat=True)

    class Meta:
        model = User
        fields = ('agency_id', 'cell_phone', 'first_name', 'id', 'last_name', 'username', 'email', 'is_superuser', 'display_phone', 'user_perms', 'incident_perms', 'vet_perms', 'email_notification', 'organizations', 'org_slugs', 'version')
