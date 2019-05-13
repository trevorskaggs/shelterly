
from django.shortcuts import render, redirect
from django.views import generic
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from animals.models import Animal
from animals.forms import AnimalForm
from people.models import Owner
from people.views import owner_detail




# Create your views here.
class AnimalListView(generic.ListView):
    model = Animal
    context_object_name = 'animal_list'
    template_name = 'animal_list.html'

def new_animal(request, species):
    if request.POST:
        form = AnimalForm
        animal = form.save()
        #return redirect('animals:animal_edit', pk=animal.pk)
        return HttpResponseRedirect(reverse_lazy('animals:animal_list'))
    form = AnimalForm(species)
    return render(request, 'animal_new.html', {'form':form})

class AnimalDetailView(generic.DetailView):
    model = Animal
    template_name = "animal_detail.html"

def AnimalEditView(request, pk):
    animal = Animal.objects.get(pk=pk)
    if request.POST:
        form = AnimalForm(animal.species, request.POST, instance=animal)
        form.save()
    form = AnimalForm(animal.species, instance=animal)
    return render(request, 'animal_new.html', {'form':form})

def new_owned_animal(request, species, pk):
    owner = Owner.objects.get(pk=pk)
    if request.POST:
        form = AnimalForm(species, request.POST)
        animal = form.save()
        animal.owner = owner
        animal.save()
        return redirect('people:owner_detail', owner.pk)
    form = AnimalForm(species)
    form.set_initial_location(owner)
    return render(request, 'animal_new.html', {'form':form, 'owner':owner})
