from django.db import models

from accounts.models import ShelterlyUser
from location.models import Location

class Person(Location):
    
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    best_contact = models.TextField(blank=True)
    drivers_license = models.CharField(max_length=50, blank=True)
    email = models.CharField(max_length=200, blank=True)

    @property
    def location_type(self):
        return 'person'

    def __str__(self):
        return '{} {}'.format(self.first_name, self.last_name)

class OwnerContactNote(models.Model):

    user = models.ForeignKey(ShelterlyUser, on_delete=models.SET_NULL)
    owner = models.ForeignKey(Person, on_delete=models.SET_NULL)
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.CharField(max_length=1000, blank=False)
