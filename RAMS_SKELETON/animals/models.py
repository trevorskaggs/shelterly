from django.db import models
from hotline.models import EvacReq
from people.models import Owner

#choice tupels
SPECIES_CHOICES = (
    ('dog', "Dog"),
    ('cat', "Cat"),
    ('oth', "Other"),
)

BREED_CHOICES = (
    ('val', "Label"),
)

SEX_CHOICES = (
    ('M', "Male"),
    ('F', "Female"),
)

PCOLOR_CHOICES = (
    ('val', "Label"),
)
SCOLOR_CHOICES = (
    ('val', "Label"),
)

MARKINGS_CHOICES = (
    ('val', "Label"),
)

SIZE_CHOICES = (
    ('L', "Large ()"),
    ('M', "Medium ()"),
    ('S', "Small ()"),
)

AGE_CHOICES = (
    ('Y', "Youth ()"),
    ('A', "Adult ()"),
    ('E', "Elderly ()"),
)

STATUS_CHOICES = (
    ('REP', "Reported"),
    ('SHL', "Sheltered"),
    ('SIP', "Sheltered In Place"),
    ('NFD', "Not Found"),
    ('RIP', "Rest In Peace"),
)


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
class Animal(models.Model):
    request = models.ForeignKey(EvacReq, on_delete=models.SET_NULL, blank=True, null=True)
    owner = models.ForeignKey(Owner, on_delete=models.SET_NULL, blank=True, null=True)
    name = models.CharField(max_length=50, blank=True, null=True)


    #choice fields
    species = models.CharField(max_length=50, choices=SPECIES_CHOICES, blank=True, null=True)
    breed = models.CharField(max_length=50, choices=BREED_CHOICES, blank=True, null=True)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, blank=True, null=True)
    pcolor = models.CharField(max_length=50, choices=PCOLOR_CHOICES, blank=True, null=True)
    scolor = models.CharField(max_length=50, choices=SCOLOR_CHOICES, blank=True, null=True)
    markings = models.CharField(max_length=50, choices=MARKINGS_CHOICES, blank=True, null=True)
    size = models.CharField(max_length=1, choices=SIZE_CHOICES, blank=True, null=True)
    age = models.CharField(max_length=1, choices=AGE_CHOICES, blank=True, null=True)
    status = models.CharField(max_length=3, choices=SIZE_CHOICES, blank=True, null=True)

    #boolean fields
    fixed = models.BooleanField(blank=True, null=True)
    aggressive = models.BooleanField(blank=True, null=True)
    confined = models.BooleanField(blank=True, null=True)
    chipped = models.BooleanField(blank=True, null=True)
    diet_needs = models.BooleanField(blank=True, null=True)
    med_needs = models.BooleanField(blank=True, null=True)

    #text fields
    collar_info = models.TextField(blank=True, null=True)
    tag_info = models.TextField(blank=True, null=True)
    chip_info = models.TextField(blank=True, null=True)
    diet_notes = models.TextField(blank=True, null=True)
    med_notes = models.TextField(blank=True, null=True)

    #address
    address = models.CharField(max_length=50, blank=True, null=True)
    apartment = models.CharField(max_length=50, blank=True, null=True)
    city = models.CharField(max_length=50, blank=True, null=True)
    state = models.CharField(max_length=2, choices=STATE_CHOICES, blank=True, null=True)
    zip_code = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)


    class Meta:
        ordering = []

    def __str__(self):
        return self.name
