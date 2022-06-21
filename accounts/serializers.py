import re

from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):

    display_phone = serializers.SerializerMethodField()

    # Custom field for Formated Phone Number
    def get_display_phone(self, obj):
        return re.sub(r'(\d{3})(\d{3})(\d{4})(.*)', r'(\1) \2-\3 \4', obj.cell_phone.replace(' ', ''))

    class Meta:
        model = User
        fields = ('agency_id', 'cell_phone', 'first_name', 'id', 'last_name', 'username', 'email', 'is_superuser', 'display_phone')
