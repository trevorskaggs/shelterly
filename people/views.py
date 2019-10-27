from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.db.models import Q
from animals.models import Animal
from people.models import Owner
from hotline.models import EvacReq
from people.forms import OwnerForm, TeamMemberForm


# Create your views here.

def owner_list(request):
    owner_list = Owner.objects.all()
    search_term = ''

    if 'search' in request.GET:
        search_term = request.GET['search']
        namequery = Q(first_name__icontains=search_term)|Q(last_name__icontains=search_term)
        owner_list = Owner.objects.filter(namequery)

    context = {
    'owner_list':owner_list,
    'search_term':search_term,
    }
    return render(request, 'owner_list.html', context)

def owner_new(request):
    if request.POST:
        form = OwnerForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('people:owner_list')
    form = OwnerForm()
    return render(request, 'owner.html', {'form':form})


def owner_edit(request, pk):
    owner = get_object_or_404(Owner, pk=pk)
    if request.POST:
        form = NewOwnerForm(request.POST, instance=owner)
        form.save()
        return render('owner_list.html')
    form = NewOwnerForm(instance=owner)
    return render(request, 'owner.html', {'form':form})

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
    owner = get_object_or_404(Owner, pk=pk)
    evac_request = get_object_or_404(EvacReq, owner=owner)
    context = {
        'evac_request':evac_request,
        'owner':owner,
    }
    return render(request, 'owner_detail.html', context)

def owner_edit(request, pk):
    owner = get_object_or_404(Owner, pk=pk)
    if request.POST:
        form = OwnerForm(request.POST, instance=owner)
        form.save()
        return redirect('people:owner_detail', owner.pk)
    form = OwnerForm(instance=owner)
    return render(request, 'owner_edit.html', {'form':form})

def team_member(request, pk=None):
    team_member = get_object_or_404(TeamMember, pk=pk) if pk else None
    if request.POST:
        form = TeamMemberForm(request.POST, instance=team_member)
        form.save()
        return redirect('evac:evac_landing')
    form = TeamMemberForm(instance=team_member)
    return render(request, 'team_member.html', {'form':form})
