from django.db import models

class Organization(models.Model):

    name = models.CharField(max_length=80)
    short_name = models.CharField(max_length=40, blank=True, null=True)
    liability_name = models.CharField(max_length=80)
    liability_short_name = models.CharField(max_length=40)


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
