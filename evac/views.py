from django.shortcuts import render, redirect
from evac.models import EvacTeam
from evac.forms import EvacTeamForm

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
