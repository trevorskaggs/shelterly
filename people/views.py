from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import viewsets

from animals.models import Animal
from people.models import Person, TeamMember
from hotline.models import ServiceRequest
from people.forms import PersonForm, TeamMemberForm
from people.serializers import TeamMemberSerializer

# Create your views here.

def owner(request, pk=None):
    owner = get_object_or_404(Person, pk=pk) if pk else None
    form = PersonForm(request.POST or None, instance=owner)
    if form.is_valid():
        form.save()
        return redirect('people:owner_detail', owner.pk)
    return render(request, 'person.html', {'form':form, 'person_type': 'Owner'})

def owner_delete(request, pk):
    owner = get_object_or_404(Owner, pk=pk)
    if request.POST:
        owner.delete()
        return render(request, 'owner_delete_success.html')
    context = {
    'owner':owner,
    }
    return render(request, "owner_delete.html", context)

def owner_detail(request, pk):
    owner = get_object_or_404(Person, pk=pk)
    return render(request, 'owner_detail.html', {'owner':owner})

def team_member(request, pk=None):
    team_member = get_object_or_404(TeamMember, pk=pk) if pk else None
    form = TeamMemberForm(None, request.POST or None, instance=team_member)
    if form.is_valid():
        form.save()
        return redirect('evac:evac_landing')
    return render(request, 'team_member.html', {'form':form})

class TeamMemberViewSet(viewsets.ModelViewSet):

    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
