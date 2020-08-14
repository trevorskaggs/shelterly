from django.core.files.storage import FileSystemStorage
from django.db.models import Count, Exists, OuterRef, Q
from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from .serializers import ServiceRequestSerializer

from animals.models import Animal
from animals.forms import AnimalForm
from hotline.models import ServiceRequest
from hotline.forms import ServiceRequestForm, ServiceRequestSearchForm
from people.models import Person
from people.forms import PersonForm
from rest_framework import filters, permissions, viewsets


# Create your views here.
def hotline_landing(request):
    return render(request, 'hotline_landing.html')

def hotline_new_owner(request, rep_pk=None):
    form = PersonForm(request.POST or None)
    if form.is_valid():
        owner = form.save()
        if rep_pk:
            return redirect('hotline:service_request_new', owner_pk=owner.pk, rep_pk=rep_pk)
        return redirect('hotline:service_request_new', owner_pk=owner.pk)
    return render(request, 'person.html', {'form':form, 'person_type':'Owner'})

def hotline_new_reporter(request):
    form = PersonForm(request.POST or None)
    if form.is_valid():
        reporter = form.save()
        return redirect('hotline:hotline_new_owner', rep_pk=reporter.pk)
    return render(request, 'person.html', {'form':form, 'person_type':'Reporter'})

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

def service_request_update(request, service_request_pk):
    service_request = ServiceRequest.objects.get(pk=service_request_pk) if service_request_pk else None
    form = ServiceRequestForm(service_request, request.POST or None, instance=service_request)
    if form.is_valid():
        form.save()
        return redirect('hotline:service_request_detail', service_request_pk=service_request_pk)
    return render(request, 'service_request_edit.html', {'form':form})

def service_request_add_owner(request, service_request_pk):
    service_request = ServiceRequest.objects.get(pk=service_request_pk) if service_request_pk else None
    form = PersonForm(request.POST or None)
    if form.is_valid():
        owner = form.save()
        service_request.owner = owner
        service_request.save()
        return redirect('hotline:service_request_detail', service_request_pk=service_request_pk)
    return render(request, 'owner.html', {'form':form})

def service_request_add_animal(request, service_request_pk, species):
    service_request = ServiceRequest.objects.get(pk=service_request_pk)
    form = AnimalForm(species, service_request.owner, request.POST or None, initial={'owner':service_request.owner})
    if form.is_valid():
        animal = form.save()
        animal.request = service_request
        animal.save()
        return redirect('hotline:service_request_detail', service_request_pk=service_request_pk)
    return render(request, 'animal.html', {'form':form})

def service_request_search(request):
    service_requests, query = None, None
    if request.POST:
        query = request.POST['search']
        service_requests = ServiceRequest.objects.filter(Q(animal__name__icontains=query) |\
            Q(owner__first_name__icontains=query) | Q(owner__last_name__icontains=query) |\
            Q(reporter__first_name__icontains=query) | Q(reporter__last_name__icontains=query)|
            Q(owner__address__icontains=query) | Q(owner__city__icontains=query)).distinct()
    search_form = ServiceRequestSearchForm()
    search_form.fields['search'].initial = query
    data = {'form':search_form, 'service_requests':service_requests, 'query': query}
    return render(request, 'service_request_list.html', data)


def service_request_list(request, status='all'):
    if status == 'unresolved':
        service_requests = ServiceRequest.objects.filter(animal__status__in=['REPORTED', 'NOT FOUND']).distinct()
    elif status == 'resolved':
        service_requests = ServiceRequest.objects.exclude(animal__status__in=['REPORTED', 'NOT FOUND']).distinct()
    else:
        service_requests = ServiceRequest.objects.all().distinct()
    data = {'service_requests':service_requests, 'status': status}
    return render(request, 'service_request_list.html', data)


class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.all()
    search_fields = ['address', 'city', 'animal__name', 'owner__first_name', 'owner__last_name', 'owner__address', 'owner__city', 'reporter__first_name', 'reporter__last_name']
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = ServiceRequestSerializer
    ordering_fields = ['injured', 'animal_count']
    ordering = ['-injured', '-animal_count']

    # When creating, update any animals associated with the SR owner with the created service request.
    def perform_create(self, serializer):
        if serializer.is_valid():
            service_request = serializer.save()
            service_request.set_lat_lon()
            if service_request.owner:
                service_request.owner.animal_set.update(request=service_request.id)

    def get_queryset(self):
        queryset = ServiceRequest.objects.all().annotate(animal_count=Count('animal')).annotate(injured=Exists(Animal.objects.filter(request_id=OuterRef('id'), injured='yes')))

        status = self.request.query_params.get('status', '')
        if status == 'open':
            queryset = queryset.filter(animal__status__in=['REPORTED', 'ASSIGNED']).distinct()
        elif status == 'closed':
            queryset = queryset.exclude(animal__status__in=['REPORTED', 'ASSIGNED']).distinct()

        aco_required = self.request.query_params.get('aco_required', '')
        if aco_required == 'true':
            queryset = queryset.filter(Q(animal__aggressive='yes') | Q(animal__species='other'))
        return queryset
