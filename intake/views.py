from django.shortcuts import render, redirect
from hotline.models import EvacReq
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
    evac_reqs = EvacReq.objects.filter(outcome__isnull=True)
    return render(request, 'evac_req_list.html', {'evac_reqs':evac_reqs})
