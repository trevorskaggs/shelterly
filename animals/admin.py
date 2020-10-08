from django.contrib import admin
from django.urls import reverse
from django.utils.html import escape, mark_safe

from animals.models import Animal, AnimalImage

class AnimalImageAdmin(admin.ModelAdmin):

  def animal_str(self, obj: Animal):
    link = reverse("admin:animals_animal_change", args=[obj.animal_id])
    return mark_safe(f'<a href="{link}">{escape(obj.animal.__str__())}</a>')

  animal_str.short_description = 'Animal'
  animal_str.admin_order_field = 'animal'

  list_display = ('id', 'animal_str', 'image', 'category')

# Register your models here.
admin.site.register(Animal)
admin.site.register(AnimalImage, AnimalImageAdmin)
