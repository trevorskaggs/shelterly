from django.db import models
from location.models import Location
# Create your models here.

class BaseShelterModel(models.Model):

    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=400, blank=True)

    def __str__(self):
        return self.name.upper()

    class Meta:
        abstract=True
        ordering = ['name',]

class Shelter(BaseShelterModel, Location):

    image = models.ImageField(upload_to='media/images/shelter', blank=True)

    @property
    def location_type(self):
        return 'shelter'
    

class Building(BaseShelterModel):

    shelter = models.ForeignKey(Shelter, on_delete=models.CASCADE)

    @property
    def parent(self):
        return self.shelter


class Room(BaseShelterModel):

    building = models.ForeignKey(Building, on_delete=models.CASCADE)

    @property
    def parent(self):
        return self.building
   
