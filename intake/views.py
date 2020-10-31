from django.shortcuts import render, redirect

from animals.forms import AnimalForm
from hotline.models import ServiceRequest
from people.forms import PersonForm
from people.views import owner_detail
from people.models import Person

# Create your views here.
def intake_landing(request):
    return render(request, 'intake_landing.html')

def intake_owned(request):
    form = PersonForm(request.POST or None)
    if form.is_valid():
        owner = form.save()
        return redirect('people:owner_detail', owner.pk)
    return render(request, 'owner.html', {'form':form})

def intake_new_animal(request, owner_pk, species):
    owner = Person.objects.get(pk=owner_pk)
    form = AnimalForm(species, owner, request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('people:owner_detail', owner.pk)
    return render(request, 'animal.html', {'form':form})

def select_dispatch_req(request):
    service_requests = ServiceRequest.objects.all()
    return render(request, 'service_request_list.html', {'service_requests':service_requests})
