from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class EvacTeam(models.Model):

    evac_team_members = models.ManyToManyField(User)
    team_date = models.DateField(auto_now_add=True)
    callsign = models.CharField(max_length=20)

    def str(self):
        return '%s (%s)' % (self.callsign, self.evac_team_members.all().count())