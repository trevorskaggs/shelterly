from django.shortcuts import render, redirect
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework import permissions, viewsets

from animals.models import Animal
from hotline.models import ServiceRequest
from people.forms import PersonForm
from people.models import Person
from people.serializers import PersonSerializer


def owner(request, pk=None):
    owner = get_object_or_404(Person, pk=pk) if pk else None
    form = PersonForm(request.POST or None, instance=owner)
    if form.is_valid():
        form.save()
        return redirect('people:owner_detail', owner.pk)
    return render(request, 'owner.html', {'form':form})

def owner_delete(request, pk):
    owner = get_object_or_404(Person, pk=pk)
    if request.POST:
        owner.delete()
        return render(request, 'owner_delete_success.html')
    context = {
    'owner':owner,
    }
    return render(request, "owner_delete.html", context)

def owner_detail(request, pk):
    owner = get_object_or_404(Person, pk=pk)
    return render(request, 'owner_detail.html', {'owner':owner})

# Provides view for Person API calls.
class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = PersonSerializer
