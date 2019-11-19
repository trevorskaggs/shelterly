from django.db import models

from animals.choices import AGE_CHOICES, BREED_CHOICES, SEX_CHOICES, SIZE_CHOICES, SPECIES_CHOICES, STATUS_CHOICES
from animals.colors import DOG_COLOR_CHOICES, DOG_PATTERN_CHOICES
from location.models import Location
from hotline.models import ServiceRequest
from people.models import Person
from shelter.models import Cage


# Create your models here.
class Animal(Location):

    request = models.ForeignKey(ServiceRequest, on_delete=models.SET_NULL, blank=True, null=True)
    owner = models.ForeignKey(Person, on_delete=models.SET_NULL, blank=True, null=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    cage = models.ForeignKey(Cage, on_delete=models.SET_NULL, blank=True, null=True)
    image = models.ImageField(upload_to='images/animals', blank=True, null=True)

    #choice fields
    species = models.CharField(max_length=50, choices=SPECIES_CHOICES, blank=True, null=True)
    breed = models.CharField(max_length=50, choices=BREED_CHOICES, blank=True, null=True)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, blank=True, null=True)
    pcolor = models.CharField(max_length=50, choices=DOG_COLOR_CHOICES, blank=True, null=True)
    scolor = models.CharField(max_length=50, choices=DOG_COLOR_CHOICES, blank=True, null=True)
    markings = models.CharField(max_length=50, choices=DOG_PATTERN_CHOICES, blank=True, null=True)
    size = models.CharField(max_length=1, choices=SIZE_CHOICES, blank=True, null=True)
    age = models.CharField(max_length=1, choices=AGE_CHOICES, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, blank=True, null=True, default='Reported')

    #boolean fields
    fixed = models.BooleanField(blank=True, null=True)
    aggressive = models.BooleanField(blank=True, null=True)
    confined = models.BooleanField(blank=True, null=True)
    chipped = models.BooleanField(blank=True, null=True)
    diet_needs = models.BooleanField(blank=True, null=True)
    med_needs = models.BooleanField(blank=True, null=True)
    collared = models.BooleanField(blank=True, null=True)
    attended_to = models.BooleanField(blank=True, null=True)

    #text fields
    collar_info = models.TextField(blank=True, null=True)
    behavior_notes = models.TextField(blank=True, null=True)
    chip_info = models.TextField(blank=True, null=True)
    diet_notes = models.TextField(blank=True, null=True)
    med_notes = models.TextField(blank=True, null=True)
    last_seen = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)

    def assign_cage(self, cage_pk):
        from shelter.models import Cage
        cage = Cage.objects.get(pk=cage_pk)

    class Meta:
        ordering = []
