
from django.shortcuts import render, redirect
from django.views import generic
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from animals.models import Animal
from animals.forms import DogForm, CatForm, OtherForm
from people.models import Owner
from people.views import owner_detail




# Create your views here.
class AnimalListView(generic.ListView):
    model = Animal
    context_object_name = 'animal_list'
    template_name = 'animal_list.html'

SPECIES_DICT = {
    'dog': DogForm,
    'cat': CatForm,
    'oth': OtherForm,
}

def AnimalNewView(request, species):
    if request.POST:
        form = SPECIES_DICT[species](request.POST)
        animal = form.save()
        #return redirect('animals:animal_edit', pk=animal.pk)
        return HttpResponseRedirect(reverse_lazy('animals:animal_list'))
    form = SPECIES_DICT[species]()
    return render(request, 'animal_new.html', {'form':form})

class AnimalDetailView(generic.DetailView):
    model = Animal
    template_name = "animal_detail.html"

def AnimalEditView(request, pk):
    animal = Animal.objects.get(pk=pk)
    if request.POST:
        form = SPECIES_DICT['dog'](request.POST, instance=animal)
        form.save()
    form = SPECIES_DICT['dog'](instance=animal)
    return render(request, 'animal_new.html', {'form':form})

class AnimalDeleteView(generic.edit.DeleteView):
    model = Animal
    template_name = "owner_delete.html"
    success_url = "http://127.0.0.1:8000/animals/"


def new_owned_animal(request, species, pk):
    owner = Owner.objects.get(pk=pk)
    if request.POST:
        form = SPECIES_DICT[species](request.POST)
        form.save(owner)
        return redirect('people:owner_detail', owner.pk)
    form = SPECIES_DICT[species]()
    form.set_initial_location(owner)
    return render(request, 'animal_new.html', {'form':form, 'owner':owner})
