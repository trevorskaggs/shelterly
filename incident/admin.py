from django.contrib import admin

from incident.models import Incident, Organization

@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ('slug', 'organization', 'name', 'latitude', 'longitude')

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'short_name', 'liability_name', 'liability_short_name',)

