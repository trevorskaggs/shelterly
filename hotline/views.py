from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404

from animals.forms import AnimalForm
from hotline.models import ServiceRequest
from hotline.forms import HotlineOwnerForm, HotlineReporterForm, ServiceRequestForm
from people.models import Owner, Reporter

# Create your views here.
def hotline_landing(request):
    return render(request, 'hotline_landing.html')

def hotline_new_reporter(request):
    form = HotlineReporterForm(request.POST or None)
    if form.is_valid():
        reporter = form.save()
        return redirect('hotline:hotline_new_owner', rep_pk=reporter.pk)
    return render(request, 'hotline_new_reporter.html', {'form':form})

def hotline_new_owner(request, rep_pk=None):
    form = HotlineOwnerForm(request.POST or None)
    if form.is_valid():
        owner = form.save()
        if rep_pk:
            return redirect('hotline:service_request_new', owner_pk=owner.pk, rep_pk=rep_pk)
        else:
            return redirect('hotline:service_request_new', owner_pk=owner.pk)
    return render(request, 'hotline_new_owner.html', {'form':form})

def hotline_new_animal(request, service_request_pk, species):
    form = AnimalForm(species, request.POST or None)
    if form.is_valid():
        animal = form.save()
        service_request = get_object_or_404(ServiceRequest, pk=service_req_pk)
        animal.request = service_request
        animal.status = 'REP'
        animal.owner = service_request.owner
        animal.save()
        return redirect('hotline:service_request_detail', service_request_pk=service_request_pk)
    form.set_species_properties(species)
    return render(request, 'animal_new.html', {'form':form})

def service_request_new(request, owner_pk=None, rep_pk=None):
    reporter = Reporter.objects.get(pk=rep_pk) if rep_pk else None
    owner = Owner.objects.get(pk=owner_pk) if owner_pk else None
    form = ServiceRequestForm(owner, request.POST or None)
    if form.is_valid():
        service_request = form.save()
        service_request.owner = owner
        service_request.reporter = reporter
        service_request.save()
        return redirect('hotline:service_request_detail', service_request_pk=service_request.pk)
    return render(request, 'service_request.html', {'form':form})

def service_request_list(request):
    service_request_list = ServiceRequest.objects.all()
    context = {'service_request_list':service_request_list}
    return render(request, 'service_request_list.html', context)

def service_request_list_open(request):
    service_request_list_open = [req for req in ServiceRequest.objects.all() if req.is_resolved == False]
    context = {
    'service_request_list_open':service_request_list_open
    }
    return render(request, 'service_request_list_open.html', context)

def service_request_list_closed(request):
    service_request_list_closed = [req for req in ServiceRequest.objects.all() if req.is_resolved == True]
    context = {'service_request_list_closed':service_request_list_closed}
    return render(request, 'service_request_list_closed.html', context)

def service_request_edit(request, service_request_pk):
    service_request_obj = ServiceRequest.objects.get(pk=service_request_pk) if service_request_pk else None
    form = ServiceRequestForm(None, request.POST or None, instance=service_request_obj)
    if form.is_valid():
        form.save()
        return redirect('hotline:service_request_detail', service_request_pk=service_request_pk)
    return render(request, 'service_request_edit.html', {'form':form})

def service_request_detail(request, service_request_pk):
    service_request = get_object_or_404(ServiceRequest, pk=service_request_pk)
    context = {'service_request':service_request}
    return render(request, 'service_request_details.html', context)
