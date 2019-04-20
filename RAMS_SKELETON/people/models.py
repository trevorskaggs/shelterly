from django.db import models
#choice tuples
STATE_CHOICES = (
    ('AL', "AL"),
    ('AK', "AK"),
    ('AZ', "AZ"),
    ('AR', "AR"),
    ('CA', "CA"),
    ('CO', "CO"),
    ('CT', "CT"),
    ('DE', "DE"),
    ('FL', "FL"),
    ('GA', "GA"),
    ('HI', "HI"),
    ('ID', "ID"),
    ('IL', "IL"),
    ('IN', "IN"),
    ('IA', "IA"),
    ('KS', "KS"),
    ('KY', "KY"),
    ('LA', "LA"),
    ('ME', "ME"),
    ('MD', "MD"),
    ('MA', "MA"),
    ('MI', "MI"),
    ('MN', "MN"),
    ('MS', "MS"),
    ('MO', "MO"),
    ('MT', "MT"),
    ('NE', "NE"),
    ('NV', "NV"),
    ('NH', "NH"),
    ('NJ', "NJ"),
    ('NM', "NM"),
    ('NY', "NY"),
    ('NC', "NC"),
    ('ND', "ND"),
    ('OH', "OH"),
    ('OK', "OK"),
    ('PA', "PA"),
    ('RI', "RI"),
    ('SC', "SC"),
    ('SD', "SD"),
    ('TN', "TN"),
    ('TX', "TX"),
    ('VA', "VA"),
    ('WA', "WA"),
    ('WV', "WV"),
    ('WI', "WI"),
    ('WY', "WY"),
)
# Create your models here.
class Person(models.Model):
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    home_phone = models.CharField(max_length=50, blank=True, null=True)
    work_phone = models.CharField(max_length=50, blank=True, null=True)
    cell_phone = models.CharField(max_length=50, blank=True, null=True)
    best_contact = models.TextField(blank=True, null=True)
    drivers_license = models.CharField(max_length=50, blank=True, null=True)

    #address
    address = models.CharField(max_length=50, blank=True, null=True)
    apartment = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    state = models.CharField(max_length=2, choices=STATE_CHOICES, blank=True, null=True)
    zip_code = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)

    class Meta:
        abstract = True
        ordering = []

    def __str__(self):
        return self.first_name + ' ' + self.last_name

    def get_absolute_url(self):
        return  "http://127.0.0.1:8000/owners/"

class Owner(Person):
    reporter = models.OneToOneField('reporter', on_delete=models.SET_NULL, blank=True, null=True)


class Reporter(Person):
    class Meta:
        ordering = []

    def __str__(self):
        return self.field_name

class Worker(Person):
    class Meta:
        ordering = []

    def __str__(self):
        return self.field_name
