from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404

from animals.forms import AnimalForm
from hotline.models import ServiceRequest
from hotline.forms import ServiceRequestForm
from people.models import Person
from people.forms import PersonForm

# Create your views here.
def hotline_landing(request):
    return render(request, 'hotline_landing.html')

def hotline_new_reporter(request):
    form = PersonForm(request.POST or None)
    if form.is_valid():
        reporter = form.save()
        return redirect('hotline:hotline_new_owner', rep_pk=reporter.pk)
    return render(request, 'hotline_new_reporter.html', {'form':form})

def hotline_new_owner(request, rep_pk=None):
    form = PersonForm(request.POST or None)
    if form.is_valid():
        owner = form.save()
        if rep_pk:
            return redirect('hotline:service_request_new', owner_pk=owner.pk, rep_pk=rep_pk)
        else:
            return redirect('hotline:service_request_new', owner_pk=owner.pk)
    return render(request, 'hotline_new_owner.html', {'form':form})

def service_request_list(request, status='all'):
    if status == 'unresovled':
        service_requests = ServiceRequest.objects.filter(animal__status__in=['NFD', 'REP']).distinct()
    elif status == 'resolved':
        service_requests = ServiceRequest.objects.exclude(animal__status__in=['NFD', 'REP']).distinct()
    else:
        service_requests = ServiceRequest.objects.all().distinct()
    context = {'service_requests':service_requests, 'status': status}
    return render(request, 'service_request_list.html', context)

def service_request_detail(request, service_request_pk):
    service_request = get_object_or_404(ServiceRequest, pk=service_request_pk)
    context = {'service_request':service_request}
    return render(request, 'service_request_details.html', context)

def service_request_new(request, owner_pk=None, rep_pk=None):
    reporter = Person.objects.get(pk=rep_pk) if rep_pk else None
    owner = Person.objects.get(pk=owner_pk) if owner_pk else None
    form = ServiceRequestForm(owner, request.POST or None)
    if form.is_valid():
        service_request = form.save()
        service_request.owner = owner
        service_request.reporter = reporter
        service_request.save()
        return redirect('hotline:service_request_detail', service_request_pk=service_request.pk)
    return render(request, 'service_request.html', {'form':form})

def service_request_edit(request, service_request_pk):
    service_request_obj = ServiceRequest.objects.get(pk=service_request_pk) if service_request_pk else None
    form = ServiceRequestForm(None, request.POST or None, instance=service_request_obj)
    if form.is_valid():
        form.save()
        return redirect('hotline:service_request_detail', service_request_pk=service_request_pk)
    return render(request, 'service_request_edit.html', {'form':form})

def service_request_add_animal(request, service_request_pk, species):
    service_request = ServiceRequest.objects.get(pk=service_request_pk)
    form = AnimalForm(species, service_request.owner, request.POST or None, initial={'owner':service_request.owner})
    if form.is_valid():
        animal = form.save()
        animal.request = service_request
        animal.save()
        return redirect('hotline:service_request_detail', service_request_pk=service_request_pk)
    return render(request, 'animal.html', {'form':form})
