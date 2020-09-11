from django.contrib import admin
from animals.models import Animal, AnimalImage

# Register your models here.
admin.site.register(Animal)
admin.site.register(AnimalImage)