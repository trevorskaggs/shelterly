from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import ShelterlyUser

admin.site.register(ShelterlyUser, UserAdmin)
