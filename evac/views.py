from django.shortcuts import render, redirect
from evac.models import EvacTeam
from evac.forms import EvacTeamForm
from people.models import TeamMember
from people.forms import TeamMemberForm
# Create your views here.
def evac_landing(request):
    return render(request, 'evac_landing.html', {})

def evac_team(request, pk=None):
    evac_team = EvacTeam.objects.get(pk=pk) if pk else None
    if request.POST:
        form = EvacTeamForm(request.POST, instance=evac_team)
        return redirect('evac:evac_landing')
    form = EvacTeamForm(instance=evac_team)
    return render(request, 'evac_team.html', {'form':form})

def team_member(request, pk=None):
    team_member = TeamMember.objects.get(pk=pk) if pk else None
    if request.POST:
        form = TeamMemberForm(request.POST, instance=team_member)
        form.save()
        return redirect('evac:evac_landing')
    form = TeamMemberForm(instance=team_member)
    return render(request, 'team_member.html', {'form':form})
