from django.shortcuts import get_object_or_404, render, redirect

from shelter.models import Shelter, Building, Room, Cage
from shelter.forms import ShelterForm, BuildingForm

# Create your views here.
def shelter_landing(request):
    return render(request, 'shelter_landing.html')

def shelter_list(request):
    shelter_list = Shelter.objects.all()
    return render(request, 'shelter_list.html', {'shelter_list':shelter_list})

def shelter_detail(request, pk):
    shelter = get_object_or_404(Shelter, pk=pk)
    return render(request, 'shelter_details.html', {'shelter':shelter})

def shelter_new(request):
    form = ShelterForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('shelter:shelter_list')
    return render(request, 'shelter.html', {'form':form})

def building_detail(request, pk):
    building = get_object_or_404(Building, pk=pk)
    return render(request, 'building_details.html', {'building':building})

def building_new(request, pk):
    import ipdb; ipdb.set_trace()
    shelter = Shelter.objects.get(pk=pk)
    form = BuildingForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('shelter:shelter_detail', pk)
    form.fields['shelter'].initial = shelter
    return render(request, 'shelter.html', {'form':form})

def room_detail(request, pk):
    room = get_object_or_404(Room, pk=pk)
    return render(request, 'room_details.html', {'room':room})

def cage_detail(request, pk):
    cage = get_object_or_404(Cage, pk=pk)
    return render(request, 'cage_details.html', {'cage':cage})