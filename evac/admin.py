from django.contrib import admin
from evac.models import DispatchTeam, EvacAssignment, EvacTeamMember

# Register your models here.
admin.site.register(EvacAssignment)
admin.site.register(EvacTeamMember)
admin.site.register(DispatchTeam)
