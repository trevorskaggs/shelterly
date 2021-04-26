from django.db import models
from location.models import Location
# Create your models here.

class BaseShelterModel(models.Model):

    name = models.CharField(max_length=100)
    description = models.CharField(max_length=400, blank=True)

    def __str__(self):
        return self.name.upper()

    class Meta:
        abstract=True
        ordering = ['name',]

class Shelter(BaseShelterModel, Location):

    name = models.CharField(max_length=100, unique=True)
    image = models.ImageField(upload_to='media/images/shelter', blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True)

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
