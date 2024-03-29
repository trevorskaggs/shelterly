from django.contrib import admin

from incident.models import Incident, Organization

class IncidentAdmin(admin.ModelAdmin):
    list_display = ('slug', 'organization', 'name', 'latitude', 'longitude')

class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'short_name', 'liability_name', 'liability_short_name',)

admin.site.register(Incident, IncidentAdmin)
admin.site.register(Organization, OrganizationAdmin)
