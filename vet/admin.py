from django.contrib import admin

from vet.models import VetRequest

class VetRequestAdmin(admin.ModelAdmin):
  list_display = ('id', 'patient', 'assignee',)

# Register your models here.
admin.site.register(VetRequest, VetRequestAdmin)
