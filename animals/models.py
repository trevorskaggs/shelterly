from django.db import models
from location.models import Location
from ordered_model.models import OrderedModel

from animals.choices import ALL_AGE_CHOICES, ALL_SIZE_CHOICES, SEX_CHOICES, SPECIES_CHOICES, STATUS_CHOICES, UNKNOWN_CHOICES
from animals.colors import ALL_COLOR_CHOICES
from hotline.models import ServiceRequest
from people.models import Person
from shelter.models import Room, Shelter

# Create your models here.
class Animal(Location, OrderedModel):

    request = models.ForeignKey(ServiceRequest, on_delete=models.SET_NULL, blank=True, null=True)
    owners = models.ManyToManyField(Person, blank=True)
    reporter = models.ForeignKey(Person, on_delete=models.SET_NULL, blank=True, null=True, related_name="animals")
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, blank=True, null=True)
    shelter = models.ForeignKey(Shelter, on_delete=models.SET_NULL, blank=True, null=True)

    #choice fields
    species = models.CharField(max_length=50, choices=SPECIES_CHOICES, blank=True)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, blank=True)
    pcolor = models.CharField(max_length=50, choices=ALL_COLOR_CHOICES, verbose_name='Primary Color', blank=True)
    scolor = models.CharField(max_length=50, choices=ALL_COLOR_CHOICES, verbose_name='Secondary Color', blank=True)
    color_notes = models.CharField(max_length=200, blank=True)
    size = models.CharField(max_length=10, choices=ALL_SIZE_CHOICES, blank=True)
    age = models.CharField(max_length=10, choices=ALL_AGE_CHOICES, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REPORTED')

    #boolean fields
    fixed = models.CharField(max_length=10, choices=UNKNOWN_CHOICES, default='unknown')
    aggressive = models.CharField(max_length=10, choices=UNKNOWN_CHOICES, default='unknown')
    confined = models.CharField(max_length=10, choices=UNKNOWN_CHOICES, default='unknown')
    injured = models.CharField(max_length=10, choices=UNKNOWN_CHOICES, default='unknown')

    #text fields
    name = models.CharField(max_length=50, blank=True)
    behavior_notes = models.TextField(blank=True, max_length=200)
    medical_notes = models.TextField(blank=True, max_length=200)
    last_seen = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    intake_date = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)

    order_with_respect_to = 'room'

    @property
    def kennel_card_image(self):
        animal_images = self.animalimage_set.all()
        if animal_images.filter(category='front_image').exists():
            return animal_images.filter(category='front_image')[0]
        elif animal_images.filter(category='side_image').exists():
            return animal_images.filter(category='side_image')[0]
    

    class Meta:
        ordering = ('order',)

class AnimalImage(models.Model):

    image = models.ImageField(upload_to='images/')
    animal = models.ForeignKey(Animal, on_delete=models.SET_NULL, null=True)
    category = models.CharField(max_length=20)
