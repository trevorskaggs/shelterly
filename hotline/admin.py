from django.contrib import admin
from django.urls import reverse
from django.utils.html import escape, mark_safe

from hotline.models import ServiceRequest, VisitNote
from location.utils import build_full_address
from people.models import Person

class ServiceRequestAdmin(admin.ModelAdmin):

  # def owner_str(self, obj: Person):
  #   link = reverse("admin:people_person_change", args=[obj.owner_id])
  #   return mark_safe(f'<a href="{link}">{escape(obj.owner.__str__())}</a>')

  def animal_count(self, obj):
    return obj.animal_set.all().count()

  def address(self, obj):
    return build_full_address(obj)

  list_display = ('id', 'address', 'status', 'animal_count')

class VisitNoteAdmin(admin.ModelAdmin):

  list_display = ('id', 'notes')


admin.site.register(ServiceRequest, ServiceRequestAdmin)
admin.site.register(VisitNote, VisitNoteAdmin)
