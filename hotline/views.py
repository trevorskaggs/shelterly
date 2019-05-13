from django.shortcuts import render, redirect
from django.views import generic
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from people.models import Owner
from animals.models import Animal
from animals.forms import AnimalForm
from .models import EvacReq
from .forms import HotlineOwnerForm, EvacRequestForm


# Create your views here.
def hotline_landing(request):
    return render(request, 'hotline_landing.html')

def hotline_new_owner(request):
    if request.POST:
        form = HotlineOwnerForm(request.POST)
        owner = form.save()
        return redirect('hotline:evac_request_new', owner_pk=owner.pk)
    form = HotlineOwnerForm()
    return render(request, 'hotline_new_owner.html', {'form':form})

def evac_request_new(request, owner_pk):
    owner = Owner.objects.get(pk=owner_pk)
    if request.POST:
        form = EvacRequestForm(request.POST)
        evac_req = form.save()
        evac_req.owner = owner
        evac_req.save()
        return redirect('hotline:evac_request_detail', evac_req_pk=evac_req.pk)
    form = EvacRequestForm()
    return render(request, 'evac_request.html', {'form':form})

def evac_request_edit(request, pk):
    evac_request_obj = EvacReq.objects.get(pk=pk)
    if request.POST:
        form = EvacRequestForm(request.POST, instance=evac_request_obj)
        form.save()
        return redirect('hotline:evac_request', evac_request=evac_request, pk=pk )
    form = EvacRequestForm(instance=evac_request_obj)
    return render(request, 'evac_request.html', {'form':form})

def evac_request_detail(request, evac_req_pk):
    evac_request = EvacReq.objects.get(pk=evac_req_pk)
    owner = evac_request.owner
    owned_animal_list = Animal.objects.all().filter(owner=owner)
    context = {
        'owned_animal_list':owned_animal_list,
        'owner':owner,
        'evac_request':evac_request,
    }
    return render(request, 'evac_request_details.html', context)

def hotline_new_animal(request, evac_req_pk, species):
    if request.POST:
        form = AnimalForm(request.POST)
        owner = Owner.objects.get(pk=pk)
        form.instance.owner = owner
        animal = form.save()
        #return redirect('animals:animal_edit', pk=animal.pk)
        return redirect('hotline:evac_request', evac_request=evac_request, pk=owner.pk)
    form = AnimalForm()
    form.set_species_properties(species)
    return render(request, 'animal_new.html', {'form':form})
