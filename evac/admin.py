from django.contrib import admin
from evac.models import DispatchTeam, EvacAssignment, EvacTeamMember

class DispatchTeamAdmin(admin.ModelAdmin):
  list_display = ('id', 'name',)

# Register your models here.
admin.site.register(EvacAssignment)
admin.site.register(EvacTeamMember)
admin.site.register(DispatchTeam, DispatchTeamAdmin)
