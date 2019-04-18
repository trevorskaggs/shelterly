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
    fields = ['first_name', 'last_name', 'home_phone', 'work_phone', 'cell_phone', 'best_contact', 'drivers_license', 'address', 'apartment', 'city', 'state', 'zip_code']

class OwnerDetailView(generic.DetailView):
    model = Owner
    template_name = "owner_detail.html"

class OwnerDeleteView(generic.edit.DeleteView):
    model = Owner
    template_name = "owner_delete.html"
    success_url = "http://127.0.0.1:8000/owners/"
