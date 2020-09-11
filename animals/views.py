
from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from rest_framework import filters, viewsets

from people.models import Person
from animals.models import Animal, AnimalImage
from animals.forms import AnimalForm, ImageForm
from animals.serializers import AnimalSerializer


# Create your views here.
def animal_list(request):
    animal_list = Animal.objects.all()
    context = {
    'animal_list':animal_list,
    }
    return render(request, 'animal_list.html', context)

def new_animal(request, species, owner_pk=None):
    owner = Person.objects.get(pk=owner_pk) if owner_pk else None
    form = AnimalForm(species, owner, request.FILES, request.FILES or None, request.POST or None)
    if form.is_valid():
        form.save()
        return HttpResponseRedirect(reverse_lazy('animals:animal_list'))
    return render(request, 'animal.html', {'form':form})

def animal_detail(request, pk):
    animal = get_object_or_404(Animal, pk=pk)
    data = {'animal':animal}
    return render(request,'animal_detail.html', data)


def animal_edit(request, pk):
    animal = get_object_or_404(Animal, pk=pk)
    form = AnimalForm(animal.species, animal.owner, request.POST or None, instance=animal)
    if form.is_valid():
        form.save()
        return redirect('animals:animal_detail', pk=pk)
    return render(request, 'animal.html', {'form':form})

def animal_delete(request, pk):
    animal = get_object_or_404(Animal, pk=pk)
    if request.POST:
        animal.delete()
        return render(request, 'animal_delete_success.html')
    data = {'animal':animal}
    return render(request, 'animal_delete.html', data)

def animal_image(request, pk):
    animal = get_object_or_404(Animal, pk=pk)
    form = ImageForm(request.POST or None, request.FILES or None)
    if form.is_valid():
        animal.image = request.FILES['image']
        animal.save()
        return redirect('animals:animal_detail', pk=pk)
    return render(request, 'animal_image.html', {'form':form, 'animal':animal})

class AnimalViewSet(viewsets.ModelViewSet):

    queryset = Animal.objects.all()
    search_fields = ['name', 'species', 'status', 'request__address', 'request__city', 'owner__first_name', 'owner__last_name', 'owner__address', 'owner__city']
    filter_backends = (filters.SearchFilter,)
    serializer_class = AnimalSerializer

    # If the animal does not have an owner, create a dummy unknown owner and assign it.
    # Create image objects.
    def perform_create(self, serializer):
        if serializer.is_valid():
            animal = serializer.save()
            images_data = self.request.FILES
            for key, image_data in images_data.items():
                AnimalImage.objects.create(image=image_data, animal=animal)

            if not animal.owner:
                owner = Person.objects.create(first_name="Unknown")
                animal.owner = owner
                animal.save()
