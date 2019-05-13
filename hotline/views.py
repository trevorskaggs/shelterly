from django.shortcuts import render, redirect
from django.views import generic
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from people.models import Owner
from animals.models import Animal
from animals.forms import DogForm, CatForm, OtherForm
from .models import EvacReq
from .forms import HotlineOwnerForm, EvacRequestForm


# Create your views here.
def hotline_landing(request):
    return render(request, 'hotline_landing.html')

def start_call(request):
    evac_request = EvacReq.objects.create()
    context = {
        'evac_request':evac_request
    }
    return render(request, 'start_call.html', context)

def hotline_new_owner(request, evac_request):

    if request.POST:
        form = HotlineOwnerForm(request.POST)
        form.save()
        return redirect('hotline:evac_request_edit', evac_request=evac_request, pk=form.instance.pk)
    form = HotlineOwnerForm()
    return render(request, 'hotline_new_owner.html', {'form':form})

def evac_request_edit(request, evac_request, pk):

    owner = Owner.objects.get(pk=pk)
    evac_request_obj = EvacReq.objects.get(pk=evac_request)
    evac_request_obj.owner = owner

    if request.POST:
        form = EvacRequestForm(request.POST, instance=evac_request_obj)
        form.save()
        return redirect('hotline:evac_request', evac_request=evac_request, pk=pk )
    form = EvacRequestForm(instance=evac_request_obj)
    return render(request, 'evac_request_edit.html', {'form':form})

def evac_request(request, evac_request, pk):
    owner = Owner.objects.get(pk=pk)
    evac_request_obj = EvacReq.objects.get(pk=evac_request)
    owned_animal_list = Animal.objects.all().filter(owner=owner)
    context = {
        'owned_animal_list':owned_animal_list,
        'owner':owner,
        'evac_request':evac_request_obj,
    }
    return render(request, 'evac_request.html', context)

SPECIES_DICT = {
    'dog': DogForm,
    'cat': CatForm,
    'oth': OtherForm,
}

def hotline_new_animal(request, evac_request, pk, species):
    if request.POST:
        form = SPECIES_DICT[species](request.POST)
        owner = Owner.objects.get(pk=pk)
        form.instance.owner = owner
        animal = form.save()
        #return redirect('animals:animal_edit', pk=animal.pk)
        return redirect('hotline:evac_request', evac_request=evac_request, pk=owner.pk)
    form = SPECIES_DICT[species]()
    return render(request, 'animal_new.html', {'form':form})
