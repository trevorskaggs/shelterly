
from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from people.models import Owner
from animals.models import Animal
from animals.forms import AnimalForm


# Create your views here.
def animal_list(request):
    animal_list = Animal.objects.all()
    context = {
    'animal_list':animal_list,
    }
    return render(request, 'animal_list.html', context)

def new_animal(request, species):
    if request.POST:
        form = AnimalForm(request.POST)
        form.save()
        #return redirect('animals:animal_edit', pk=animal.pk)
        return HttpResponseRedirect(reverse_lazy('animals:animal_list'))
    form = AnimalForm(species)
    return render(request, 'animal_new.html', {'form':form})

def animal_detail(request, pk):
    animal = get_object_or_404(Animal, pk=pk)
    context = {
    'animal':animal,
    }
    return render(request,'animal_detail.html', context)


def animal_edit(request, pk):
    animal = get_object_or_404(Animal, pk=pk)
    if request.POST:
        form = AnimalForm(animal.species, request.POST, instance=animal)
        form.save()
        return redirect('animals:animal_list')
    form = AnimalForm(animal.species, instance=animal)
    return render(request, 'animal_new.html', {'form':form})

def animal_delete(request, pk):
    animal = get_object_or_404(Animal, pk=pk)
    if request.POST:
        animal.delete()
        return render(request, 'animal_delete_success.html')
    context = {
    'animal':animal,
    }
    return render(request, 'animal_delete.html', context)

def new_owned_animal(request, species, pk):
    owner = get_object_or_404(Owner, pk=pk)
    if request.POST:
        form = AnimalForm(species, request.POST)
        animal = form.save()
        animal.owner = owner
        animal.save()
        return redirect('people:owner_detail', owner.pk)
    form = AnimalForm(species)
    form.set_initial_location(owner)
    return render(request, 'animal_new.html', {'form':form, 'owner':owner})
