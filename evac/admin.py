from django.contrib import admin
from evac.models import EvacAssignment, EvacTeamMember, VisitNote

# Register your models here.
admin.site.register(EvacAssignment)
admin.site.register(EvacTeamMember)
admin.site.register(VisitNote)