from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
import re
import uuid

from accounts.models import ShelterlyUserOrg

User = get_user_model()

class Organization(models.Model):

    name = models.CharField(max_length=80)
    slug = models.CharField(max_length=20, blank=False, null=False, unique=True)
    short_name = models.CharField(max_length=10, default='changeme')
    liability_name = models.CharField(max_length=80)
    liability_short_name = models.CharField(max_length=40)

    def __str__(self):
        return '{}'.format(self.name)

    def clean(self):
        if not bool(re.search(r"^[a-z0-9]*$", self.slug)):
            raise ValidationError("Invalid slug.")

@receiver(post_save, sender=Organization)
def add_default_admins(sender, instance, created, **kwargs):
    if created:
        for user in User.objects.filter(is_superuser=True):
            user.organizations.add(instance)
            ShelterlyUserOrg.objects.filter(user=user, organization=instance).update(user_perms=True, incident_perms=True, vet_perms=True)


class Incident(models.Model):

    slug = models.CharField(max_length=20, blank=False, null=False, unique=True)
    name = models.CharField(max_length=20, blank=False, null=False)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=4)
    longitude = models.DecimalField(max_digits=9, decimal_places=4)
    training = models.BooleanField(default=False)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True)
    hide = models.BooleanField(default=False)

    def __str__(self):
        return '{}'.format(self.name)

    class Meta:
        ordering = ['name']

class TemporaryAccess(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4().hex, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    access_expires_at = models.DateField(auto_now_add=False)
    link_expires_at = models.DateField(auto_now_add=False)
