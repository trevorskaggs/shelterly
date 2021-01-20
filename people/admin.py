from django.contrib import admin
from people.models import Person, PersonChange

class PersonChangeAdmin(admin.ModelAdmin):

  readonly_fields = ('timestamp',)

admin.site.register(Person)
admin.site.register(PersonChange, PersonChangeAdmin)
