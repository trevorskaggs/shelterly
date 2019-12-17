from django.db import models
from location.models import Location
# Create your models here.

class BaseShelterModel(models.Model):

    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=400, blank=True, null=True)

    def __str__(self):
        return self.name.upper()

    class Meta:
        abstract=True
        ordering = ['name',]

class Shelter(BaseShelterModel, Location):

    image = models.ImageField(upload_to='media/images/shelter', blank=True, null=True)

    @property
    def counts(self):
        cages = Cage.objects.filter(room__building__shelter=self)
        occupied = cages.filter(animal__isnull=False)
        return 'Animals: %s, Cages: %s' % (occupied.count(), cages.count())
    

class Building(BaseShelterModel):

    shelter = models.ForeignKey(Shelter, on_delete=models.CASCADE)

    @property
    def parent(self):
        return self.shelter

    @property
    def counts(self):
        cages = Cage.objects.filter(room__building=self)
        occupied = cages.filter(animal__isnull=False)
        return 'Animals: %s, Cages: %s' % (occupied.count(), cages.count())

class Room(BaseShelterModel):

    building = models.ForeignKey(Building, on_delete=models.CASCADE)

    @property
    def parent(self):
        return self.building

    @property
    def counts(self):
        cages = Cage.objects.filter(room=self)
        occupied = cages.filter(animal__isnull=False)
        return 'Animals: %s, Cages: %s' % (occupied.count(), cages.count())

class Cage(BaseShelterModel):

    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    def __str__(self):
        return self.name.upper()

    @property
    def parent(self):
        return self.room

    @property
    def counts(self):
        return 'Animals: %s' % self.animal_set.all().count()

    @property
    def occupied(self):
        return self.animal_set.all().exists()
   
