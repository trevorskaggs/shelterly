from django.contrib import admin
from .models import ShelterlyUser

class ShelterlyUserAdmin(admin.ModelAdmin):
    exclude = ('password', 'last_login', 'username')
    list_display = ('id', 'organizations', 'email', 'first_name', 'last_name',)

    def organizations(self, obj):
        return [organization.name for organization in obj.organizations.all()]

admin.site.register(ShelterlyUser, ShelterlyUserAdmin)

