from django.contrib import admin
from .models import ShelterlyUser

class ShelterlyUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'first_name', 'last_name')

admin.site.register(ShelterlyUser, ShelterlyUserAdmin)
