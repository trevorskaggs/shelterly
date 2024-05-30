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
    org_slugs = serializers.SerializerMethodField()
    org_shorts = serializers.SerializerMethodField()
    access_expires_at = serializers.SerializerMethodField()

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

    # Custom field for user access expiration
    def get_access_expires_at(self, obj):
        if self.context.get('request') and self.context['request'].GET.get('organization'):
            return obj.perms.filter(organization=self.context['request'].GET.get('organization'))[0].access_expires_at
        return None

    def get_org_slugs(self, obj):
        return obj.organizations.all().values_list('slug', flat=True)

    def get_org_shorts(self, obj):
        return obj.organizations.all().values_list('short_name', flat=True)

    class Meta:
        model = User
        fields = ('agency_id', 'cell_phone', 'first_name', 'id', 'last_name', 'username', 'email', 'is_superuser', 'display_phone', 'user_perms', 'incident_perms', 'vet_perms', 'organizations', 'org_slugs', 'org_shorts', 'access_expires_at', 'version')

class SecureUserSerializer(UserSerializer):

    cell_phone = serializers.SerializerMethodField()
    display_phone = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    def get_cell_phone(self, obj):
        front, back = re.sub(r'(\d{3})(\d{3})(\d{4})(.*)', r'(\1) \2-\3 \4', obj.cell_phone.replace(' ', '')).split("-")
        return "(***) *** " + back

    # Custom field for Formated Phone Number
    def get_display_phone(self, obj):
        front, back = re.sub(r'(\d{3})(\d{3})(\d{4})(.*)', r'(\1) \2-\3 \4', obj.cell_phone.replace(' ', '')).split("-")
        return "***-" + back[:4]
    
    # Custom field for Formated Phone Number
    def get_email(self, obj):
        front, back = obj.email.split('@')
        return front[0] + "*"*(len(front) - 1) + "@" + back
