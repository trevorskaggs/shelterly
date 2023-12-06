from django.db import models
from incident.models import Incident
from people.models import Person
from location.models import Location
from managers import ActionHistoryQueryset
# Create your models here.

class BaseShelterModel(models.Model):

    name = models.CharField(max_length=100)
    description = models.CharField(max_length=400, blank=True)
    objects = ActionHistoryQueryset.as_manager()

    def __str__(self):
        return self.name

    class Meta:
        abstract=True
        ordering = ['name',]

def test_incident():
    return Incident.objects.get(name='Test').id

class Shelter(BaseShelterModel, Location):

    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='media/images/shelter', blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True)
    active = models.BooleanField(default=True)
    training = models.BooleanField(default=False)
    incident = models.ForeignKey(Incident, on_delete=models.CASCADE, default=test_incident)

    @property
    def location_type(self):
        return 'shelter'

    @property
    def rooms(self):
        return Room.objects.filter(building__shelter=self)
    

class Building(BaseShelterModel):

    shelter = models.ForeignKey(Shelter, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    @property
    def parent(self):
        return self.shelter


class Room(BaseShelterModel):

    building = models.ForeignKey(Building, on_delete=models.CASCADE)

    @property
    def parent(self):
        return self.building
   
    def __str__(self):
        return self.name


class IntakeSummary(models.Model):

    shelter = models.ForeignKey(Shelter, on_delete=models.CASCADE)
    intake_type = models.CharField(max_length=20, default='walkin')
    animals = models.ManyToManyField('animals.Animal', blank=True)
    person = models.ForeignKey(Person, on_delete=models.SET_NULL, null=True)
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id',]
