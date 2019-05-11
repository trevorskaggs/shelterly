from django.db import models
from people.models import TeamMember

# Create your models here.
class EvacTeam(models.Model):

    evac_team_members = models.ManyToManyField(TeamMember)

