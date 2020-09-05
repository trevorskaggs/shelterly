from django.contrib.auth import get_user_model
from django.db import models

from hotline.models import ServiceRequest

User = get_user_model()

class EvacTeamMember(models.Model):

    first_name = models.CharField(max_length=50, blank=False)
    last_name = models.CharField(max_length=50, blank=False)
    phone = models.CharField(max_length=50, blank=False)
    agency_id = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ['last_name', 'first_name']

class EvacAssignment(models.Model):

    team_members = models.ManyToManyField(EvacTeamMember)
    service_requests = models.ManyToManyField(ServiceRequest)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(blank=True)
