from django.db import models
from django.core.exceptions import ValidationError
import re

class Organization(models.Model):

    name = models.CharField(max_length=80)
    slug = models.CharField(max_length=20, blank=False, null=False, unique=True)
    short_name = models.CharField(max_length=40, blank=True, null=True)
    liability_name = models.CharField(max_length=80)
    liability_short_name = models.CharField(max_length=40)

    def __str__(self):
        return '{}'.format(self.name)

    def clean(self):
        if not bool(re.search(r"^[a-z0-9]*$", self.slug)):
            raise ValidationError("Invalid slug.")


class Incident(models.Model):

    slug = models.CharField(max_length=20, blank=False, null=False, unique=True)
    name = models.CharField(max_length=20, blank=False, null=False)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=4)
    longitude = models.DecimalField(max_digits=9, decimal_places=4)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ['name']
