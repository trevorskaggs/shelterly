from django.contrib import admin
from .models import ShelterlyUser, Organization

class ShelterlyUserAdmin(admin.ModelAdmin):
    exclude = ('password', 'last_login', 'username')
    list_display = ('id', 'email', 'first_name', 'last_name',)

class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'short_name', 'liability_name', 'liability_short_name',)

admin.site.register(ShelterlyUser, ShelterlyUserAdmin)
admin.site.register(Organization, OrganizationAdmin)
