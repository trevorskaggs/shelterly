from django.contrib import admin
from django.urls import reverse
from django.utils.html import escape, mark_safe

from animals.models import Animal, AnimalImage, Species, SpeciesCategory

class AnimalAdmin(admin.ModelAdmin):
  list_display = ('id', 'status', 'name', 'size')

class SpeciesAdmin(admin.ModelAdmin):
  list_display = ('id', 'name', 'category')

class AnimalImageAdmin(admin.ModelAdmin):

  def animal_str(self, obj: Animal):
    link = reverse("admin:animals_animal_change", args=[obj.animal_id])
    name = obj.animal.name or 'Unknown'
    return mark_safe(f'<a href="{link}">{escape(name)}</a>')

  animal_str.short_description = 'Animal'
  animal_str.admin_order_field = 'animal'

  list_display = ('id', 'animal_str', 'image', 'category')

# Register your models here.
admin.site.register(Animal, AnimalAdmin)
admin.site.register(AnimalImage, AnimalImageAdmin)
admin.site.register(Species, SpeciesAdmin)
admin.site.register(SpeciesCategory)
