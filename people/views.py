from django.shortcuts import render, redirect
from django.contrib import messages
from animals.models import Animal
from people.models import Owner
from people.forms import OwnerForm, TeamMemberForm


# Create your views here.

def owner_list(request):
    owner_list = Owner.objects.all()
    context = {
    'owner_list':owner_list,
    }
    return render(request, 'owner_list.html', context)

def owner_new(request):
    if request.POST:
        form = OwnerForm(request.POST)
        form.save()
        return redirect('people:owner_list')
    form = NewOwnerForm()
    return render(request, 'owner.html', {'form':form})


def owner_edit(request, pk):
    owner = Owner.objects.get(pk=pk)
    if request.POST:
        form = NewOwnerForm(request.POST, instance=owner)
        form.save()
        return render('owner_list.html')
    form = NewOwnerForm(instance=owner)
    return render(request, 'owner.html', {'form':form})

def owner_delete(request, pk):
    owner = Owner.objects.get(pk=pk)
    if request.POST:
        owner.delete()
        return render(request, 'owner_delete_success.html')
    context = {
    'owner':owner,
    }
    return render(request, "owner_delete.html", context)

def owner_detail(request, pk):
    owner = Owner.objects.get(pk=pk)
    animal_list = Animal.objects.filter(owner=owner)
    return render(request, 'owner_detail.html', {'owner':owner, 'animal_list':animal_list})

def owner_edit(request, pk):
    owner = Owner.objects.get(pk=pk)
    if request.POST:
        form = OwnerForm(request.POST, instance=owner)
        form.save()
        return redirect('people:owner_detail', owner.pk)
    form = OwnerForm(instance=owner)
    return render(request, 'owner_edit.html', {'form':form})

def team_member(request, pk=None):
    team_member = TeamMember.objects.get(pk=pk) if pk else None
    if request.POST:
        form = TeamMemberForm(request.POST, instance=team_member)
        form.save()
        return redirect('evac:evac_landing')
    form = TeamMemberForm(instance=team_member)
    return render(request, 'team_member.html', {'form':form})
