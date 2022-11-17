from rest_framework import filters, permissions, viewsets

from vet.models import VetRequest
from vet.serializers import VetRequestSerializer

class VetRequestViewSet(viewsets.ModelViewSet):
    queryset = VetRequest.objects.all()
    search_fields = ['id', 'name', 'species', 'status', 'pcolor', 'scolor', 'request__address', 'request__city', 'owners__first_name', 'owners__last_name', 'owners__phone', 'owners__drivers_license', 'owners__address', 'owners__city', 'reporter__first_name', 'reporter__last_name']
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = VetRequestSerializer
