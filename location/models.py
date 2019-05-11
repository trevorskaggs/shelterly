from django.db import models

STATE_CHOICES = (
    ('AL', "AL"),('AK', "AK"),('AZ', "AZ"),('AR', "AR"),('CA', "CA"),('CO', "CO"),('CT', "CT"),
    ('DE', "DE"),('FL', "FL"),('GA', "GA"),('HI', "HI"),('ID', "ID"),('IL', "IL"),('IN', "IN"),
    ('IA', "IA"),('KS', "KS"),('KY', "KY"),('LA', "LA"),('ME', "ME"),('MD', "MD"),('MA', "MA"),
    ('MI', "MI"),('MN', "MN"),('MS', "MS"),('MO', "MO"),('MT', "MT"),('NE', "NE"),('NV', "NV"),
    ('NH', "NH"),('NJ', "NJ"),('NM', "NM"),('NY', "NY"),('NC', "NC"),('ND', "ND"),('OH', "OH"),
    ('OK', "OK"),('PA', "PA"),('RI', "RI"),('SC', "SC"),('SD', "SD"),('TN', "TN"),('TX', "TX"),
    ('VA', "VA"),('WA', "WA"),('WV', "WV"),('WI', "WI"),('WY', "WY"),
)

# Create your models here.
class Location(models.Model):

    address = models.CharField(max_length=50, blank=True, null=True)
    apartment = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    state = models.CharField(max_length=2, choices=STATE_CHOICES, blank=True, null=True)
    zip_code = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    class Meta:
        abstract=True