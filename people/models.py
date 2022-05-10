from django.contrib.auth import get_user_model
from django.db import models
from location.models import Location
from managers import ActionHistoryQueryset

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
    objects = ActionHistoryQueryset.as_manager()

    @property
    def location_type(self):
        return 'person'

    def __str__(self):
        return '{} {}'.format(self.first_name, self.last_name)

    class Meta:
        ordering = ('-first_name',)

class PersonImage(models.Model):

    image = models.ImageField(upload_to='images/')
    name = models.CharField(max_length=20, blank=True)
    person = models.ForeignKey(Person, on_delete=models.SET_NULL, null=True)

class OwnerContact(models.Model):
    owner = models.ForeignKey(Person, null=True, on_delete=models.CASCADE)
    service_request = models.ForeignKey('hotline.ServiceRequest', null=True, blank=True, on_delete=models.CASCADE)
    owner_contact_time = models.DateTimeField(null=True)
    owner_contact_note = models.TextField(blank=False)

    class Meta:
        ordering = ('-owner_contact_time',)

class PersonChange(models.Model):
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    person = models.ForeignKey(Person, null=True, on_delete=models.SET_NULL)
    changes = models.JSONField()
    reason = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
