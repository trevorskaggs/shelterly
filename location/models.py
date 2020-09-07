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

    address = models.CharField(max_length=50, blank=True)
    apartment = models.CharField(max_length=50, blank=True)
    city = models.CharField(max_length=50, blank=True)
    state = models.CharField(max_length=2, choices=STATE_CHOICES, blank=True)
    zip_code = models.CharField(max_length=50, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    def save(self, *args, **kwargs):
        super(Location, self).save(*args, **kwargs)

    def set_lat_lon(self):
        try:
            query_string = (',').join([self.address or '', self.apartment or '', self.city or '', self.state or '', self.zip_code or ''])
            g = geocoder.here(query_string, app_id=settings.HERE_APP_ID, app_code=settings.HERE_APP_CODE)
            self.latitude = g.json['lat']
            self.longitude = g.json['lng']
            self.save()
        except:
            pass

    def get_location_dict(self):
        return {
            'address': self.address,
            'apartment': self.apartment,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'longitude': self.longitude,
            'latitude': self.latitude
        }

    def set_initial_location_fields(self, seed_location_obj):
        self.update(**seed_location_obj.get_location_dict())
        self.save()

    @property
    def location_output(self):
        valid_outputs = []
        address = self.address + ' ' + self.apartment if self.apartment else self.address
        for val in [address, self.city, self.state, self.zip_code]:
            if val:
                valid_outputs.append(val)
        return (', ').join(valid_outputs)    

    @property
    def location_type(self):
        pass

    @property
    def map_name(self):
        return '{}_{}'.format(self.location_type, self.pk)

    @property
    def location_wkt(self):
        if self.longitude and self.latitude:
            return 'POINT({} {})'.format(self.longitude, self.latitude)

    class Meta:
        abstract=True