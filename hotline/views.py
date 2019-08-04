from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from people.models import Owner, Reporter
from animals.forms import AnimalForm
from .models import EvacReq
from .forms import HotlineOwnerForm, HotlineReporterForm, EvacRequestForm


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
            return redirect('hotline:evac_request_new', owner_pk=owner.pk, rep_pk=rep_pk)
        else:
            return redirect('hotline:evac_request_new', owner_pk=owner.pk)
    return render(request, 'hotline_new_owner.html', {'form':form})

def hotline_new_animal(request, evac_req_pk, species):
    form = AnimalForm(species, request.POST or None)
    if form.is_valid():
        animal = form.save()
        evac_req = get_object_or_404(EvacReq, pk=evac_req_pk)
        animal.request = evac_req
        animal.status = 'REP'
        animal.owner = evac_req.owner
        animal.save()
        return redirect('hotline:evac_request_detail', evac_req_pk=evac_req_pk)
    form.set_species_properties(species)
    return render(request, 'animal_new.html', {'form':form})

def evac_request_new(request, owner_pk=None, rep_pk=None):
    reporter = Reporter.objects.get(pk=rep_pk) if rep_pk else None
    owner = Owner.objects.get(pk=owner_pk) if owner_pk else None
    form = EvacRequestForm(request.POST or None)
    if form.is_valid():
        evac_req = form.save()
        evac_req.owner = owner
        evac_req.reporter = reporter
        evac_req.save()
        return redirect('hotline:evac_request_detail', evac_req_pk=evac_req.pk)
    # Set initial location fields based on the owner values by default.
    form.set_initial_location(owner)
    return render(request, 'evac_request.html', {'form':form})

def evac_request_list(request):
    evac_request_list = EvacReq.objects.all()
    context = {'evac_request_list':evac_request_list}
    return render(request, 'evac_request_list.html', context)

def evac_request_list_open(request):
    evac_request_list_open = [req for req in EvacReq.objects.all() if req.is_resolved == False]
    context = {
    'evac_request_list_open':evac_request_list_open
    }
    return render(request, 'evac_request_list_open.html', context)

def evac_request_list_closed(request):
    evac_request_list_closed = [req for req in EvacReq.objects.all() if req.is_resolved == True]
    context = {
    'evac_request_list_closed':evac_request_list_closed
    }
    return render(request, 'evac_request_list_closed.html', context)

def evac_request_edit(request, evac_req_pk):
    evac_request_obj = get_object_or_404(EvacReq, pk=evac_req_pk)
    if request.POST:
        form = EvacRequestForm(request.POST, instance=evac_request_obj)
        form.save()
        return redirect('hotline:evac_request_detail', evac_req_pk=evac_req_pk)
    form = EvacRequestForm(instance=evac_request_obj)
    return render(request, 'evac_request_edit.html', {'form':form})

def evac_request_detail(request, evac_req_pk):
    evac_request = get_object_or_404(EvacReq, pk=evac_req_pk)
    context = {
        'evac_request':evac_request,
    }
    return render(request, 'evac_request_details.html', context)
