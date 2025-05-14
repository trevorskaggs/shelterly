from django.contrib import admin
from .models import ShelterlyUser

@admin.register(ShelterlyUser)
class ShelterlyUserAdmin(admin.ModelAdmin):
    exclude = ('password', 'last_login', 'username')
    list_display = ('id', 'user_organizations', 'email', 'first_name', 'last_name',)

    def user_organizations(self, obj):
        return [organization.name for organization in obj.organizations.all()]


