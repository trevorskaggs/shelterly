from django.db import models
from location.models import Location
from ordered_model.models import OrderedModel

from animals.choices import ALL_AGE_CHOICES, ALL_SIZE_CHOICES, SEX_CHOICES, STATUS_CHOICES, UNKNOWN_CHOICES
from animals.colors import ALL_COLOR_CHOICES
from .managers import AnimalQueryset
from hotline.models import ServiceRequest
from incident.models import Incident
from people.models import Person
from shelter.models import Room, Shelter

def test_incident():
    return Incident.objects.get(name='Test').id

class SpeciesCategory(models.Model):
    name = models.CharField(max_length=20)

    def __str__(self):
        return '{}'.format(self.name)

    class Meta:
        verbose_name_plural = 'Species categories'

class Species(models.Model):
    name = models.CharField(max_length=30)
    plural_name = models.CharField(max_length=30, blank=True, null=True)
    category = models.ForeignKey(SpeciesCategory, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return '{}'.format(self.name)

    class Meta:
        verbose_name_plural = 'Species'
        ordering = ('name',)

# Create your models here.
class Animal(Location, OrderedModel):

    id_for_incident = models.IntegerField(blank=True, null=True)

    request = models.ForeignKey(ServiceRequest, on_delete=models.SET_NULL, blank=True, null=True)
    owners = models.ManyToManyField(Person, blank=True)
    reporter = models.ForeignKey(Person, on_delete=models.SET_NULL, blank=True, null=True, related_name="reporter_animals")
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, blank=True, null=True)
    shelter = models.ForeignKey(Shelter, on_delete=models.SET_NULL, blank=True, null=True)
    medical_record = models.OneToOneField('vet.MedicalRecord', on_delete=models.DO_NOTHING, related_name='patient', null=True, blank=True)

    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, default=test_incident)

    #choice fields
    species = models.ForeignKey(Species, on_delete=models.SET_NULL, null=True)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, blank=True)
    pcolor = models.CharField(max_length=50, verbose_name='Primary Color', blank=True)
    scolor = models.CharField(max_length=50, verbose_name='Secondary Color', blank=True)
    color_notes = models.CharField(max_length=200, blank=True)
    size = models.CharField(max_length=10, choices=ALL_SIZE_CHOICES, blank=True)
    age = models.CharField(max_length=10, blank=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='REPORTED')

    #boolean fields
    fixed = models.CharField(max_length=10, choices=UNKNOWN_CHOICES, default='unknown')
    aggressive = models.CharField(max_length=10, choices=UNKNOWN_CHOICES, default='unknown')
    confined = models.CharField(max_length=10, choices=UNKNOWN_CHOICES, default='unknown')
    injured = models.CharField(max_length=10, choices=UNKNOWN_CHOICES, default='unknown')
    aco_required = models.CharField(max_length=10, choices=UNKNOWN_CHOICES, default='unknown')

    #text fields
    name = models.CharField(max_length=50, blank=True)
    behavior_notes = models.TextField(blank=True, max_length=400)
    medical_notes = models.TextField(blank=True, max_length=400)
    last_seen = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    intake_date = models.DateTimeField(auto_now=False, auto_now_add=False, blank=True, null=True)
    microchip = models.CharField(max_length=50, blank=True)

    order_with_respect_to = 'room'
    objects = AnimalQueryset.as_manager()

    @property
    def kennel_card_image(self):
        animal_images = self.animalimage_set.all()
        if animal_images.filter(category='front_image').exists():
            return animal_images.filter(category='front_image')[0]
        elif animal_images.filter(category='side_image').exists():
            return animal_images.filter(category='side_image')[0]
        return None

    def save(self, *args, **kwargs):
        if not self.pk:
            self.id_for_incident = Animal.objects.filter(incident=self.incident).count() + 1
        super(Animal, self).save(*args, **kwargs)

    class Meta:
        ordering = ('order', 'id')

class AnimalImage(models.Model):

    image = models.ImageField(upload_to='images/')
    animal = models.ForeignKey(Animal, on_delete=models.SET_NULL, null=True)
    category = models.CharField(max_length=20)
