from django.shortcuts import render, redirect
from animals.models import Animal
from people.models import Owner
from people.forms import OwnerForm, TeamMemberForm
from django.views import generic

# Create your views here.

class OwnerListView(generic.ListView):
    model = Owner
    context_object_name = 'owner_list'
    template_name = 'owner_list.html'

class OwnerNewView(generic.edit.CreateView):
    model = Owner
    template_name = 'owner_edit.html'


    fields = ['first_name', 'last_name', 'home_phone', \
        'work_phone', 'cell_phone', 'best_contact', \
        'drivers_license', 'address', 'apartment', 'city', \
        'state', 'zip_code']

class OwnerEditView(generic.edit.UpdateView):
    model = Owner
    template_name = 'owner_edit.html'
    fields = ['first_name', 'last_name', 'home_phone', \
        'work_phone', 'cell_phone', 'best_contact', \
        'drivers_license', 'address', 'apartment', 'city', \
        'state', 'zip_code']

class OwnerDeleteView(generic.edit.DeleteView):
    model = Owner
    template_name = "owner_delete.html"

def owner_detail(request, pk):
    owner = Owner.objects.get(pk=pk)
    animal_list = Animal.objects.filter(owner=owner)
    return render(request, 'owner_detail.html', {'owner':owner, 'animal_list':animal_list})

def owner_edit(request, pk):
    owner = Owner.objects.get(pk=pk)
    if request.POST:
        form = OwnerForm(request.POST, instance=owner)
        form.save()
        return redirect('people:owner_detail', owner.pk)
    form = OwnerForm(instance=owner)
    return render(request, 'owner_edit.html', {'form':form})
