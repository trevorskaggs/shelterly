from django.db import models
from location.models import Location

class Person(Location):
    
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    best_contact = models.TextField(blank=True)
    agency = models.TextField(blank=True)
    drivers_license = models.CharField(max_length=50, blank=True)
    email = models.CharField(max_length=200, blank=True)

    @property
    def location_type(self):
        return 'person'

    def __str__(self):
        return '{} {}'.format(self.first_name, self.last_name)

class OwnerContact(models.Model):

    owner = models.ForeignKey(Person, on_delete=models.CASCADE)
    owner_contact_time = models.DateTimeField()
    owner_contact_note = models.TextField(blank=False)
    animal = models.ForeignKey('animals.Animal', blank=True, null=True, on_delete=models.CASCADE)