import geocoder

from django.conf import settings
from django.db import models



STATE_CHOICES = (
    ('AL', "AL"),('AK', "AK"),('AZ', "AZ"),('AR', "AR"),('CA', "CA"),('CO', "CO"),('CT', "CT"),
    ('DE', "DE"),('FL', "FL"),('GA', "GA"),('HI', "HI"),('ID', "ID"),('IL', "IL"),('IN', "IN"),
    ('IA', "IA"),('KS', "KS"),('KY', "KY"),('LA', "LA"),('ME', "ME"),('MD', "MD"),('MA', "MA"),
    ('MI', "MI"),('MN', "MN"),('MS', "MS"),('MO', "MO"),('MT', "MT"),('NE', "NE"),('NV', "NV"),
    ('NH', "NH"),('NJ', "NJ"),('NM', "NM"),('NY', "NY"),('NC', "NC"),('ND', "ND"),('OH', "OH"),
    ('OK', "OK"),('PA', "PA"),('RI', "RI"),('SC', "SC"),('SD', "SD"),('TN', "TN"),('TX', "TX"),
    ('VA', "VA"),("VT", "VT"),('WA', "WA"),('WV', "WV"),('WI', "WI"),('WY', "WY"),
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

    def save(self, *args, **kwargs):
        self.set_lat_lon()
        super(Location, self).save(*args, **kwargs)

    def set_lat_lon(self):
        try:
            query_string = (',').join([self.address or '', self.apartment or '', self.city or '', self.state or '', self.zip_code or ''])
            g = geocoder.here(query_string, app_id=settings.HERE_APP_ID, app_code=settings.HERE_APP_CODE)
            self.latitude = g.json['lat']
            self.longitude = g.json['lng']
        except:
            pass

    def get_location_fields(self):
        return [
            ('address', self.address),
            ('apartment', self.apartment),
            ('city', self.city),
            ('state', self.state),
            ('zip_code', self.zip_code),
            #('latitude', self.latitude),
            #('longitude', self.longitude)
        ]

    class Meta:
        abstract=True