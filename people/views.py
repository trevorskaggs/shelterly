from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.db.models import Q
from animals.models import Animal
from people.models import Person
from hotline.models import ServiceRequest
from people.forms import PersonForm, TeamMemberForm


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
    form = PersonForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('people:owner_list')
    return render(request, 'owner.html', {'form':form})


def owner_edit(request, pk):
    owner = get_object_or_404(Owner, pk=pk)
    form = PersonForm(request.POST, instance=owner)
    if form.is_valid():
        form.save()
        return render('owner_list.html')
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
    service_request = get_object_or_404(ServiceRequest, owner=owner)
    context = {
        'service_request':service_request,
        'owner':owner,
    }
    return render(request, 'owner_detail.html', context)

def owner_edit(request, pk):
    owner = get_object_or_404(Owner, pk=pk)
    form = OwnerForm(None, request.POST or None, instance=owner)
    if form.is_valid(): 
        form.save()
        return redirect('people:owner_detail', owner.pk)
    return render(request, 'owner_edit.html', {'form':form})

def team_member(request, pk=None):
    team_member = get_object_or_404(TeamMember, pk=pk) if pk else None
    form = TeamMemberForm(None, request.POST or None, instance=team_member)
    if form.is_valid():
        form.save()
        return redirect('evac:evac_landing')
    return render(request, 'team_member.html', {'form':form})
