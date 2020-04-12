from datetime import datetime
from rest_framework import viewsets, permissions

from django.shortcuts import render, redirect

from evac.models import EvacTeam
from evac.forms import EvacTeamForm
from evac.serializers import EvacTeamSerializer
from people.models import TeamMember
from people.forms import TeamMemberForm

# Create your views here.
def evac_landing(request):
    return render(request, 'evac_landing.html', {})

def evac_team(request, pk=None):
    evac_team = EvacTeam.objects.get(pk=pk) if pk else None
    form = EvacTeamForm(request.POST or None, instance=evac_team)
    if form.is_valid():
        form.save()
        return redirect('evac:evac_landing')
    return render(request, 'evac_team.html', {'form':form})

def current_evac_team_list(request):
    evac_teams = EvacTeam.objects.filter(team_date=datetime.now().date())
    return render(request, 'evac_team_list.html', {'evac_teams':evac_teams})

def team_member(request, pk=None):
    team_member = TeamMember.objects.get(pk=pk) if pk else None
    form = TeamMemberForm(request.POST or None, instance=team_member)
    if request.POST and form.is_valid():
        form.save()
        return redirect('evac:evac_landing')
    return render(request, 'team_member.html', {'form':form})

class EvacTeamViewSet(viewsets.ModelViewSet):
    queryset = EvacTeam.objects.filter(team_date=datetime.now().date())
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = EvacTeamSerializer
