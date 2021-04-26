from django.db.models import Case, Count, Exists, OuterRef, Prefetch, Q, When, Value, BooleanField
from actstream import action
from datetime import datetime
from .serializers import ServiceRequestSerializer, SimpleServiceRequestSerializer, VisitNoteSerializer

from animals.models import Animal
from hotline.models import ServiceRequest, VisitNote
from people.models import Person
from rest_framework import filters, permissions, serializers, viewsets

class ServiceRequestViewSet(viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.all()
    search_fields = ['address', 'city', 'animal__name', 'owners__first_name', 'owners__last_name', 'owners__address', 'owners__city', 'reporter__first_name', 'reporter__last_name']
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    permission_classes = []
    serializer_class = SimpleServiceRequestSerializer
    detail_serializer_class = ServiceRequestSerializer
    ordering_fields = ['injured', 'animal_count']
    ordering = ['-injured', '-animal_count']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            if hasattr(self, 'detail_serializer_class'):
                return self.detail_serializer_class

        return super(ServiceRequestViewSet, self).get_serializer_class()


    def perform_create(self, serializer):
        if serializer.is_valid():
            for service_request in ServiceRequest.objects.filter(latitude=serializer.validated_data['latitude'], longitude=serializer.validated_data['longitude'], status='open'):
                reporter_id = serializer.validated_data.get('reporter').id if serializer.validated_data.get('reporter') else None
                owner_id = serializer.validated_data.get('owners')[0].id if serializer.validated_data.get('owners') else None
                Person.objects.filter(id__in=[reporter_id, owner_id]).delete()
                raise serializers.ValidationError(['Multiple open Requests may not exist with the same address.', service_request.id])
            service_request = serializer.save()
            action.send(self.request.user, verb='created service request', target=service_request)

    def perform_update(self, serializer):
        if serializer.is_valid():
            # Check if lat/log are being passed,Lat/Lon are not included when canceling a service request.
            if 'latitude' in serializer.validated_data and 'longitude' in serializer.validated_data:
                for service_request in ServiceRequest.objects.filter(latitude=serializer.validated_data['latitude'], longitude=serializer.validated_data['longitude'], status='open').exclude(id=self.kwargs['pk']):
                    raise serializers.ValidationError(['Multiple open Requests may not exist with the same address.', service_request.id])
            service_request = serializer.save()

            if service_request.status == 'canceled':
                service_request.animal_set.update(status='CANCELED')

            if self.request.data.get('reunite_animals'):
                service_request.animal_set.exclude(status='DECEASED').update(status='REUNITED', shelter=None, room=None)
                for animal in service_request.animal_set.exclude(status='DECEASED'):
                    action.send(self.request.user, verb=f'changed animal status to reunited', target=animal)
                service_request.status = 'closed'
                service_request.save()
                action.send(self.request.user, verb='closed service request', target=service_request)
            else:
                action.send(self.request.user, verb='updated service request', target=service_request)

    def get_queryset(self):
        queryset = (
            ServiceRequest.objects.all()
            .annotate(animal_count=Count("animal"))
            .annotate(
                injured=Exists(Animal.objects.filter(request_id=OuterRef("id"), injured="yes"))
            )
            .annotate(
                pending=Case(When(Q(followup_date__lte=datetime.today()) | Q(followup_date__isnull=True), then=Value(True)), default=Value(False), output_field=BooleanField())
            ).prefetch_related(Prefetch('animal_set', queryset=Animal.objects.exclude(status='CANCELED').prefetch_related('evacuation_assignments').prefetch_related(Prefetch('animalimage_set', to_attr='images')), to_attr='animals'))
            .prefetch_related('owners')
            .prefetch_related('visitnote_set')
            .select_related('reporter')
            .prefetch_related('evacuation_assignments')
        )

        # Status filter.
        status = self.request.query_params.get('status', '')
        if status in ('open', 'assigned', 'closed', 'canceled'):
            queryset = queryset.filter(status=status).distinct()

        # Exclude SRs without a geolocation when fetching for a map.
        is_map = self.request.query_params.get('map', '')
        if is_map == 'true':
            queryset = queryset.exclude(Q(latitude=None) | Q(longitude=None) | Q(animal=None)).exclude(status='canceled')
        return queryset

class VisitNoteViewSet(viewsets.ModelViewSet):

    queryset = VisitNote.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = VisitNoteSerializer
