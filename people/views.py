from rest_framework import permissions, viewsets

from people.models import Person
from people.serializers import PersonSerializer


# Provides view for Person API calls.
class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = PersonSerializer
