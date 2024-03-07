from django.contrib import admin
from evac.models import DispatchTeam, EvacAssignment, EvacTeamMember

@admin.register(DispatchTeam)
class DispatchTeamAdmin(admin.ModelAdmin):
  readonly_fields = ('dispatch_date',)
  list_display = ('id', 'name', 'dispatch_date',)

# Register your models here.
admin.site.register(EvacAssignment)
admin.site.register(EvacTeamMember)
