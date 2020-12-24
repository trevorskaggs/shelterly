from django.db.models import Prefetch
from rest_framework import permissions, viewsets
from actstream import action

from animals.models import Animal
from hotline.models import ServiceRequest
from people.models import Person
from people.serializers import PersonSerializer


# Provides view for Person API calls.
class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all().prefetch_related(Prefetch('animal_set', queryset=Animal.objects.prefetch_related(Prefetch('animalimage_set', to_attr='images')), to_attr='animals'))

    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = PersonSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():
            person = serializer.save()
            action.send(self.request.user, verb='created person', target=person)

            # If an owner is being added to an existing SR, add the owner to the SR and update all SR animals with the owner.
            if self.request.data.get('request'):
                service_request = ServiceRequest.objects.get(pk=self.request.data.get('request'))
                service_request.owner.add(person)
                for animal in service_request.animal_set.all():
                    animal.owner.add(person)

            # If an owner is being added from an animal, update the animal with the new owner.
            if self.request.data.get('animal'):
                animal = Animal.objects.get(pk=self.request.data.get('animal'))
                animal.owner.add(person)

            # If an owner is being added from an owner, update the original owner animals with the new owner.
            if self.request.data.get('owner'):
                owner = Person.objects.get(pk=self.request.data.get('owner'))
                for animal in owner.animal_set.all():
                    animal.owner.add(person)
                # If the original owner belongs to an SR, update the SR with the new owner.
                for service_request in ServiceRequest.objects.filter(owner=owner):
                    service_request.owner.add(person)

    def perform_update(self, serializer):
        if serializer.is_valid():
            person = serializer.save()
            action.send(self.request.user, verb='updated person', target=person)
