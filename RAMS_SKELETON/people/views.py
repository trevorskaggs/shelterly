from django.shortcuts import render
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
    fields = ['first_name', 'last_name', 'home_phone', 'work_phone', 'cell_phone', 'best_contact', 'drivers_license', 'address', 'state', 'zip_code']
