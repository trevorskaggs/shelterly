from django.contrib import admin

from shelter.models import Shelter, Building, Room, Cage
# Register your models here.
admin.site.register(Shelter)
admin.site.register(Building)
admin.site.register(Room)
admin.site.register(Cage)
