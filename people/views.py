from django.shortcuts import render
from animals.models import Animal
from people.models import Owner
from django.views import generic
# Create your views here.

class OwnerListView(generic.ListView):
    model = Owner
    context_object_name = 'owner_list'
    template_name = 'owner_list.html'

class OwnerNewView(generic.edit.CreateView):
    model = Owner
    template_name = 'owner_new.html'


    fields = ['first_name', 'last_name', 'home_phone', \
        'work_phone', 'cell_phone', 'best_contact', \
        'drivers_license', 'address', 'apartment', 'city', \
        'state', 'zip_code']

class OwnerEditView(generic.edit.UpdateView):
    model = Owner
    template_name = 'owner_new.html'
    fields = ['first_name', 'last_name', 'home_phone', \
        'work_phone', 'cell_phone', 'best_contact', \
        'drivers_license', 'address', 'apartment', 'city', \
        'state', 'zip_code']

class OwnerDeleteView(generic.edit.DeleteView):
    model = Owner
    template_name = "owner_delete.html"
    success_url = "http://127.0.0.1:8000/owners/"

def owner_detail(request, pk):
    owner = Owner.objects.get(pk=pk)
    animal_list = Animal.objects.filter(owner=owner)
    return render(request, 'owner_detail.html', {'owner':owner, 'animal_list':animal_list})