from django.shortcuts import render, redirect
from django.views import generic
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from people.models import Owner
from animals.models import Animal
from animals.forms import DogForm, CatForm, OtherForm
from .forms import HotlineOwnerForm


# Create your views here.
def hotline_landing(request):
    return render(request, 'hotline_landing.html')

def start_call(request):
    return render(request, 'start_call.html')

def hotline_new_owner(request):
    if request.POST:
        form = HotlineOwnerForm(request.POST)
        form.save()
        return redirect('hotline:hotline_summ_owner', pk=form.instance.pk)
    form = HotlineOwnerForm()
    return render(request, 'hotline_new_owner.html', {'form':form})

def hotline_summ_owner(request, pk):
    owner = Owner.objects.get(pk=pk)
    owned_animal_list = Animal.objects.all().filter(owner=owner)
    context = {
        'owned_animal_list':owned_animal_list,
        'owner':owner,
    }
    return render(request, 'hotline_summ_owner.html', context)

SPECIES_DICT = {
    'dog': DogForm,
    'cat': CatForm,
    'oth': OtherForm,
}

def hotline_new_animal(request, species, pk):
    if request.POST:
        form = SPECIES_DICT[species](request.POST)
        owner = Owner.objects.get(pk=pk)
        form.instance.owner = owner
        animal = form.save()
        #return redirect('animals:animal_edit', pk=animal.pk)
        return redirect('hotline:hotline_summ_owner', pk=owner.pk)
    form = SPECIES_DICT[species]()
    return render(request, 'animal_new.html', {'form':form})
