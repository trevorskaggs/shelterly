from django.contrib import admin
from django.urls import reverse
from django.utils.html import escape, mark_safe

from animals.models import Animal, AnimalImage, Species, SpeciesCategory

@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
  list_display = ('id', 'id_for_incident', 'animal_count', 'species', 'status', 'name')

@admin.register(Species)
class SpeciesAdmin(admin.ModelAdmin):
  list_display = ('id', 'name', 'category')

@admin.register(AnimalImage)
class AnimalImageAdmin(admin.ModelAdmin):

  @admin.display(
      description='Animal',
      ordering='animal',
  )
  def animal_str(self, obj: Animal):
    link = reverse("admin:animals_animal_change", args=[obj.animal_id])
    name = obj.animal.name or 'Unknown'
    return mark_safe(f'<a href="{link}">{escape(name)}</a>')


  list_display = ('id', 'animal_str', 'image', 'category',)

# Register your models here.
admin.site.register(SpeciesCategory)
