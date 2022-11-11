from django.db import models


class Incident(models.Model):

    slug = models.CharField(max_length=20, blank=False, null=False, unique=True)
    name = models.CharField(max_length=20, blank=False, null=False)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=4)
    longitude = models.DecimalField(max_digits=9, decimal_places=4)

    class Meta:
        ordering = ['name']
