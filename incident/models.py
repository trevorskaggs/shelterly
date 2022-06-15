from django.db import models


class Incident(models.Model):

    slug = models.CharField(primary_key=True, max_length=20, blank=False, null=False)
    name = models.CharField(max_length=20, blank=False, null=False)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
