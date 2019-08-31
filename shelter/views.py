from django.shortcuts import get_object_or_404, render

from shelter.models import Shelter, Building, Room, Cage

# Create your views here.
def shelter_list(request):
    shelter_list = Shelter.objects.all()
    return render(request, 'shelter_list.html', {'shelter_list':shelter_list})

def shelter_detail(request, pk):
    shelter = get_object_or_404(Shelter, pk=pk)
    return render(request, 'shelter_detail.html', {'shelter':shelter})

def building_detail(request, pk):
    building = get_object_or_404(Building, pk=pk)
    return render(request, 'building_detail.html', {'building':building})

def room_detail(request, pk):
    room = get_object_or_404(Room, pk=pk)
    return render(request, 'room_detail.html', {'room':room})

def cage_detail(request, pk):
    cage = get_object_or_404(Cage, pk=pk)
    return render(request, 'cage_detail.html', {'cage':cage})