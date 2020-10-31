from django.contrib import admin
from dispatch.models import DispatchAssignment, DispatchTeamMember

# Register your models here.
admin.site.register(DispatchAssignment)
admin.site.register(DispatchTeamMember)