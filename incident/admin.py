from django.contrib import admin

from incident.models import Incident

class IncidentAdmin(admin.ModelAdmin):

    list_display = ('slug', 'name', 'latitude', 'longitude')

admin.site.register(Incident, IncidentAdmin)
