from rest_framework import filters, permissions, viewsets
from actstream import action

from people.models import Person
from people.serializers import PersonSerializer


# Provides view for Person API calls.
class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    search_fields = ['first_name', 'last_name']
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = PersonSerializer

    def get_queryset(self):
        queryset = Person.objects.all().order_by('-first_name')
        queryset.select_related('owner').all()
        return queryset

    def perform_create(self, serializer):
        if serializer.is_valid():
            person = serializer.save()
            action.send(self.request.user, verb='created person', target=person)

    def perform_update(self, serializer):
        if serializer.is_valid():
            person = serializer.save()
            action.send(self.request.user, verb='updated person', target=person)
