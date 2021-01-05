from django.contrib.auth import get_user_model
from django.db import models
from location.models import Location

User = get_user_model()

class Person(Location):
    
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    alt_phone = models.CharField(max_length=50, blank=True)
    comments = models.TextField(blank=True)
    agency = models.TextField(blank=True)
    drivers_license = models.CharField(max_length=50, blank=True)
    email = models.CharField(max_length=200, blank=True)

    @property
    def location_type(self):
        return 'person'

    def __str__(self):
        return '{} {}'.format(self.first_name, self.last_name)

class PersonChange(models.Model):
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    person = models.ForeignKey(Person, null=True, on_delete=models.SET_NULL)
    changes = models.JSONField()
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
