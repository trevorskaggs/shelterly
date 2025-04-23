from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.exceptions import ValidationError
import re
import uuid

User = get_user_model()

class Organization(models.Model):

    name = models.CharField(max_length=80)
    slug = models.CharField(max_length=20, blank=False, null=False, unique=True)
    short_name = models.CharField(max_length=10, default='changeme')
    liability_name = models.CharField(max_length=80)
    liability_short_name = models.CharField(max_length=40)
    caltopo_enabled = models.BooleanField(default=False)
    watchduty_enabled = models.BooleanField(default=False)

    def __str__(self):
        return '{}'.format(self.name)

    def clean(self):
        if not bool(re.search(r"^[a-z0-9]*$", self.slug)):
            raise ValidationError("Invalid slug.")

@receiver(post_save, sender=Organization)
def add_default_admins(sender, instance, created, **kwargs):
    if created:
        from accounts.models import ShelterlyUserOrg
        for user in User.objects.filter(is_superuser=True):
            user.organizations.add(instance)
            ShelterlyUserOrg.objects.filter(user=user, organization=instance).update(user_perms=True, incident_perms=True, vet_perms=True)


class Incident(models.Model):

    slug = models.CharField(max_length=20, blank=False, null=False)
    name = models.CharField(max_length=20, blank=False, null=False)
    description = models.CharField(max_length=500, blank=True, null=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=4)
    longitude = models.DecimalField(max_digits=9, decimal_places=4)
    training = models.BooleanField(default=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=False, blank=True)
    caltopo_map_id = models.CharField(max_length=10, blank=True, null=True)
    watchduty_map_id = models.CharField(max_length=10, blank=True, null=True)
    default_followup_days = models.IntegerField(default=1, blank=False, null=False)
    hide = models.BooleanField(default=False)

    def __str__(self):
        return '{}'.format(self.name)

    class Meta:
        ordering = ['name']


class IncidentNotification(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE)
    hotline_notifications = models.BooleanField(default=False)
    dispatch_notifications = models.BooleanField(default=False)


class TemporaryAccess(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    access_expires_at = models.DateField(auto_now_add=False, blank=True, null=True)
    link_expires_at = models.DateField(auto_now_add=False)

    class Meta:
        ordering = ['-created_at']
