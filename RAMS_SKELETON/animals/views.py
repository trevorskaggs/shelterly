
from django.shortcuts import render, redirect
from .forms import DogForm
from animals.models import animal
# Create your views here.
def AnimalBaseView(request):
    return render(request, "animalbase.html")

def NewAnimalView(request):
    if request.method == 'POST':
        form = DogForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('animal_base')
    else:
        form = DogForm()

    context = {
        'form': form,
    }

    return render(request, 'animalnew.html', context)
