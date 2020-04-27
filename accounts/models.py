from django.contrib.auth.models import AbstractUser
from django.db import models
from location.models import Location
from form_utils import NAME_VALIDATOR, PHONE_VALIDATOR

class ShelterlyUser(AbstractUser):

    cell_phone = models.CharField(max_length=50, blank=False, null=False)
    agency_id = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return '{} {}'.format(self.first_name, self.last_name)
