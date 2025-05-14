from django.contrib import admin
from people.models import OwnerContact, Person, PersonChange


@admin.register(OwnerContact)
class OwnerContactAdmin(admin.ModelAdmin):

    list_display = ('owner_contact_time', 'owner', 'owner_contact_note')

from people.models import Person, PersonChange

@admin.register(PersonChange)
class PersonChangeAdmin(admin.ModelAdmin):

  readonly_fields = ('timestamp',)

admin.site.register(Person)
