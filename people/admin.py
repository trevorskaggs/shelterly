from django.contrib import admin
from people.models import Owner
from animals.models import Animal
# Register your models here.
admin.site.register(Owner)
admin.site.register(Animal)
