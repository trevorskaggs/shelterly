from rest_framework import permissions, viewsets
from actstream import action

from people.models import Person
from people.serializers import PersonSerializer


# Provides view for Person API calls.
class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = PersonSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():
            person = serializer.save()
            action.send(self.request.user, verb='created person', target=person)

    def perform_update(self, serializer):
        if serializer.is_valid():
            person = serializer.save()
            action.send(self.request.user, verb='updated person', target=person)
