from django import forms
from evac.models import EvacTeam

class EvacTeamForm(forms.ModelForm):

    class Meta:
        model = EvacTeam
        fields = ['evac_team_members', 'callsign']

