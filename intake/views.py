from django.shortcuts import render, redirect
from hotline.models import ServiceRequest
from people.forms import OwnerForm
from people.views import owner_detail
from people.models import Owner, Reporter

# Create your views here.
def intake_landing(request):
    return render(request, 'intake_landing.html')

def intake_owned(request):
    if request.POST:
        form = OwnerForm(request.POST)
        owner = form.save()
        return redirect('people:owner_detail', owner.pk)
    form = OwnerForm()
    return render(request, 'owner_edit.html', {'form':form})

def select_evac_req(request):
    service_requests = ServiceRequest.objects.filter(outcome__isnull=True)
    return render(request, 'service_request_list.html', {'service_requests':service_requests})
