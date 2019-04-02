from django.db import models

# Create your models here.
class animal(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        ordering = []

    def __str__(self):
        return self.field_name
class person(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_lenght=50)
    address =
    city =
    state =
    zip = models.PositiveSmallIntegerField()
    coordinates =
    home_phone = models.PositiveIntegerField()
    work_phone = models.PositiveIntegerField()
    cell_phone = models.PositiveIntegerField()
    best_contact =
    drivers_license =

    class Meta:
        ordering = []

    def __str__(self):
        return self.field_name
class ser_req(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = []

    def __str__(self):
        return self.field_name
