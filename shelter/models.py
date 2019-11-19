from django.db import models
from location.models import Location
# Create your models here.

class Shelter(Location):

    name = models.CharField(max_length=100)
    description = models.CharField(max_length=400, blank=True, null=True)
    image = models.ImageField(upload_to='images/shelter', blank=True, null=True)

    @property
    def animals(self):
        from animals.models import Animal
        return Animal.objects.filter(cage__room__building__shelter=self)

    def __str__(self):
        return self.name

class Building(models.Model):

    name = models.CharField(max_length=100)
    description = models.CharField(max_length=400, blank=True, null=True)
    shelter = models.ForeignKey(Shelter, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Room(models.Model):

    name = models.CharField(max_length=100)
    description = models.CharField(max_length=400, blank=True, null=True)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class Cage(models.Model):

    name = models.CharField(max_length=100)
    description = models.CharField(max_length=400, blank=True, null=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    def __str__(self):
        return self.name