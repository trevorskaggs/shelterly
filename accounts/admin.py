from django.contrib import admin
from .models import ShelterlyUser

class ShelterlyUserAdmin(admin.ModelAdmin):
    exclude = ('password', 'last_login', 'username')
    list_display = ('id', 'email', 'first_name', 'last_name',)

admin.site.register(ShelterlyUser, ShelterlyUserAdmin)
