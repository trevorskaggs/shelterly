from django.db import models
from location.models import Location

# Create your models here.
class Person(Location):
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    home_phone = models.CharField(max_length=50, blank=True, null=True)
    work_phone = models.CharField(max_length=50, blank=True, null=True)
    cell_phone = models.CharField(max_length=50, blank=True, null=True)
    best_contact = models.TextField(blank=True, null=True)
    drivers_license = models.CharField(max_length=50, blank=True, null=True)

    def __unicode__(self):
        return self.first_name + ' ' + self.last_name