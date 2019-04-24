
from django.shortcuts import render, redirect
from .forms import DogForm, CatForm, OtherForm
from animals.models import animal
from django.http import HttpResponse
from django.urls import reverse

# Create your views here.
def AnimalBaseView(request):
    return render(request, "animalbase.html")

def NewAnimalView(request):

    if r'animals/dog/new' in request.path:
        form_class = DogForm
    elif r'animals/cat/new' in request.path:
        form_class = CatForm
    else:
        form_class = OtherForm

    if request.method == "POST":
        form = form_class(request.POST)
        form.save()
        return HttpResponseRedirect('animals:animal_base')

    else:
        form = form_class()

    return render(request, 'animalnew.html', {'form':form})
