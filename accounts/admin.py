from django.contrib import admin
from .models import ShelterlyUser

class ShelterlyUserAdmin(admin.ModelAdmin):
    exclude = ('password', 'last_login')
    list_display = ('id', 'username', 'first_name', 'last_name')

admin.site.register(ShelterlyUser, ShelterlyUserAdmin)
