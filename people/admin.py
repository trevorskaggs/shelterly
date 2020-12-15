from django.contrib import admin
from people.models import OwnerContact, Person


class OwnerContactAdmin(admin.ModelAdmin):

    list_display = ('owner_contact_time', 'owner', 'animal', 'owner_contact_note')


admin.site.register(OwnerContact, OwnerContactAdmin)
admin.site.register(Person)
