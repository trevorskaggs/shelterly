from django.db import models
from location.models import Location
from form_utils import NAME_VALIDATOR, PHONE_VALIDATOR

class Person(Location):
    
    first_name = models.CharField(max_length=50, validators=[NAME_VALIDATOR])
    last_name = models.CharField(max_length=50, validators=[NAME_VALIDATOR])
    phone = models.CharField(max_length=50, blank=True, null=True, validators=[PHONE_VALIDATOR])
    best_contact = models.TextField(blank=True, null=True)
    drivers_license = models.CharField(max_length=50, blank=True, null=True)

    @property
    def location_type(self):
        return 'person'

    def __str__(self):
        return '{} {}'.format(self.first_name, self.last_name)

class TeamMember(models.Model):

    first_name = models.CharField(max_length=50, blank=False, null=False)
    last_name = models.CharField(max_length=50, blank=False, null=False)
    cell_phone = models.CharField(max_length=50, blank=False, null=False)
    agency_id = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return '{} {}'.format(self.first_name, self.last_name)
