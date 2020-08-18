
from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from rest_framework import filters, permissions, viewsets

from people.models import Person
from animals.models import Animal
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
    search_fields = ['name', 'owner__first_name', 'owner__last_name'] #need to add reporter first and last
    # search_fields = ['name', 'species', 'status', 'request__address', 'request__city', 'owner__first_name', 'owner__last_name', 'owner__address', 'owner__city']
    filter_backends = (filters.SearchFilter,)
    serializer_class = AnimalSerializer

    permission_classes = [permissions.IsAuthenticated, ] # bill added

    # # When creating, if the animal does not have an owner, create a dummy known owner and assign it.
    # def perform_create(self, serializer):
    #     if serializer.is_valid():
    #         serializer = serializer.save()
    #         if not serializer.owner:
    #             owner = Person.objects.create(first_name="Unknown")
    #             serializer.owner = owner
    #             serializer.save()

    # STEALING THIS CODE FROM SR SEARCH
    # When creating, update any animals associated with the SR owner with the created service request.
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer = serializer.save()
            if serializer.owner:
                serializer.owner.animal_set.update(request=serializer.id)

    # STEALING THIS CODE FROM SR SEARCH
    def get_queryset(self):
        queryset = Animal.objects.all()  #CHANGED THIS - BP
        # status = self.request.query_params.get('status', '')
        # DON'T THINK I NEED TO FILTER OR EXCLUDE ANY ANIMALS AT THIS POINT - BP
        # if status == 'open':
        #     queryset = queryset.filter(animal__status__in=['REPORTED', 'ASSIGNED']).distinct()
        # elif status == 'closed':
        #     queryset = queryset.exclude(animal__status__in=['REPORTED', 'ASSIGNED']).distinct()
        return queryset


