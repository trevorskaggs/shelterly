from django.db import models
import uuid
'''
from django.apps import apps
ser_req = apps.get_model('hotline', 'ser_req')
owner = apps.get_model('people', 'owner')
'''

# Create your models here.
class animal(models.Model):
    '''#keys
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    request = models.ForeignKey('ser_req', on_delete=SET_NULL)
    owner = models.ForeignKey('owner', on_delete=models.SET_NULL, blank=True, null=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    '''
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
    city = models.CharField(max_length=50, blank=True, null=True)
    state = models.CharField(max_length=50, blank=True, null=True)
    zip = models.PositiveSmallIntegerField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)


    class Meta:
        ordering = []

    def __str__(self):
        return self.field_name
