import io
import json

from evac.models import EvacAssignment
from django.db import transaction
from django.db.models import Case, Count, Exists, OuterRef, Prefetch, Q, Sum, When, Value, BooleanField
from django.http import HttpResponse, JsonResponse
from actstream import action
from datetime import datetime, timedelta
from .serializers import BarebonesServiceRequestSerializer, ServiceRequestSerializer, ServiceRequestNoteSerializer, MapServiceRequestSerializer, SimpleServiceRequestSerializer, VisitNoteSerializer
from .ordering import MyCustomOrdering
from wsgiref.util import FileWrapper
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from animals.models import Animal
from animals.views import MultipleFieldLookupMixin
from hotline.models import ServiceRequest, ServiceRequestImage, ServiceRequestNote, VisitNote
from incident.models import Incident
from evac.models import AssignedRequest

from rest_framework import filters, permissions, serializers, viewsets
from rest_framework.decorators import action as drf_action

class ServiceRequestViewSet(MultipleFieldLookupMixin, viewsets.ModelViewSet):
    queryset = ServiceRequest.objects.all()
    lookup_fields = ['pk', 'incident', 'id_for_incident']
    search_fields = ['address', 'city', 'animal__name', 'owners__last_name', 'reporter__last_name']
    filter_backends = (filters.SearchFilter, MyCustomOrdering)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = SimpleServiceRequestSerializer
    light_serializer_class = BarebonesServiceRequestSerializer
    detail_serializer_class = ServiceRequestSerializer
    map_serializer_class = MapServiceRequestSerializer

    def get_serializer_class(self):
        if self.action == 'retrieve':
            if hasattr(self, 'detail_serializer_class'):
                return self.detail_serializer_class
        if self.request.query_params.get('landingmap', False):
            if hasattr(self, 'map_serializer_class'):
                return self.map_serializer_class
        elif self.action == 'list':
            if self.request.GET.get('light', 'false') == 'true' and hasattr(self, 'light_serializer_class'):
                return self.light_serializer_class
        return super(ServiceRequestViewSet, self).get_serializer_class()


    def perform_create(self, serializer):
        if serializer.is_valid():

            total_srs = ServiceRequest.objects.select_for_update().filter(incident__slug=self.request.data.get('incident_slug')).values_list('id', flat=True)
            with transaction.atomic():
                count = len(total_srs)
                serializer.validated_data['id_for_incident'] = count + 1

            if self.request.data.get('incident_slug'):
                serializer.validated_data['incident'] = Incident.objects.get(slug=self.request.data.get('incident_slug'))

            service_request = serializer.save()
            action.send(self.request.user, verb='created service request', target=service_request)

            # Notify maps that there is new data.
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)("map", {"type":"new_data"})

    def perform_update(self, serializer):
        from evac.models import AssignedRequest

        if serializer.is_valid():

            service_request = serializer.save()

            if service_request.status == 'canceled':
                service_request.animal_set.update(status='CANCELED')
                action.send(self.request.user, verb='canceled service request', target=service_request)

                for assigned_request in AssignedRequest.objects.filter(service_request=service_request, dispatch_assignment__end_time=None):
                    for animal in service_request.animal_set.all():
                        if assigned_request.animals.get(str(animal.id)):
                            assigned_request.animals[str(animal.id)]['status'] = 'CANCELED'
                    assigned_request.save()

            elif self.request.FILES.keys():
              # Create new files from uploads
              for key in self.request.FILES.keys():
                  image_data = self.request.FILES[key]
                  ServiceRequestImage.objects.create(image=image_data, name=self.request.data.get('name'), service_request=service_request)
            elif self.request.data.get('edit_image'):
                ServiceRequestImage.objects.filter(id=self.request.data.get('id')).update(name=self.request.data.get('edit_image'))
            elif self.request.data.get('remove_image'):
                ServiceRequestImage.objects.filter(id=self.request.data.get('remove_image')).delete()

            elif self.request.data.get('new_request_id'):
                sr = ServiceRequest.objects.get(id=self.request.data.get('new_request_id'))
                animals = Animal.objects.filter(id__in=self.request.data.get('animal_ids'))
                animals.update(request=sr)
                for animal in animals:
                    action.send(self.request.user, verb='transferred this animal from SR#' + str(service_request.id_for_incident) + ' to SR#' + str(sr.id_for_incident), target=animal)
                action.send(self.request.user, verb='transferred animals to SR#' + str(sr.id_for_incident), target=service_request)
                action.send(self.request.user, verb='transferred animals from SR#' + str(service_request.id_for_incident) + ' to here', target=sr)

            elif self.request.data.get('reunite_animals'):
                for animal in service_request.animal_set.exclude(status__in=['DECEASED', 'NO FURTHER ACTION', 'REUNITED']):
                    action.send(self.request.user, verb=f'changed animal status to reunited', target=animal)
                    for assigned_request in AssignedRequest.objects.filter(service_request=serializer.instance.id, dispatch_assignment__end_time=None):
                        assigned_request.animals[str(serializer.instance.id)]['status'] = 'REUNITED'
                        assigned_request.save()
                service_request.animal_set.exclude(status__in=['DECEASED', 'NO FURTHER ACTION', 'REUNITED']).update(status='REUNITED', shelter=None, room=None)
                service_request.update_status(self.request.user)
            else:
                action.send(self.request.user, verb='updated service request', target=service_request)

    def get_queryset(self):
        queryset = (
            ServiceRequest.objects.all()
            .annotate(
                animal_count=Sum("animal__animal_count", default=0)
            )
            .annotate(
                injured=Exists(Animal.objects.filter(request_id=OuterRef("id"), injured="yes"))
            )
            .annotate(
                pending=Case(When(followup_date__gte=datetime.today() + timedelta(days=1) if self.request.query_params.get('when', '') == 'tomorrow' else datetime.today(), then=Value(True)), default=Value(False), output_field=BooleanField())
            ).prefetch_related(Prefetch('animal_set', queryset=Animal.objects.with_images().exclude(status='CANCELED').order_by('id').prefetch_related('owners').select_related('species'), to_attr='animals'))
            .prefetch_related('owners')
            .select_related('reporter')
            .prefetch_related('assignedrequest_set')
            .prefetch_related(Prefetch('evacuation_assignments', EvacAssignment.objects.select_related('team').prefetch_related('team__team_members')))
        )

        # Status filter.
        status = self.request.query_params.get('status', '')
        if status in ('open', 'assigned', 'closed', 'canceled'):
            queryset = queryset.filter(status=status).distinct()
        exclude_status = self.request.query_params.get('exclude_status', '')
        if exclude_status in ('open', 'assigned', 'closed', 'canceled'):
            queryset = queryset.exclude(status=exclude_status).distinct()

        # Exclude SRs without a geolocation when fetching for a map.
        is_map = self.request.query_params.get('map', '')  or self.request.query_params.get('landingmap', '')
        if is_map == 'true':
            queryset = queryset.exclude(Q(latitude=None) | Q(longitude=None)).exclude(status='canceled')
        if self.request.GET.get('incident'):
            queryset = queryset.filter(incident__slug=self.request.GET.get('incident'))
        return queryset

    @drf_action(detail=True, methods=['GET'], name='Download GeoJSON')
    def download(self, request, pk=None):
        sr = ServiceRequest.objects.get(id=pk)
        data = {"features":[sr.get_feature_json()]}
        data_string = json.dumps(data)
        json_file = io.StringIO()
        json_file.write(data_string)
        json_file.seek(0)

        wrapper = FileWrapper(json_file)
        response = HttpResponse(wrapper, content_type='application/json')
        response['Content-Disposition'] = 'attachement; filename=SR-' + str(sr.id_for_incident) + '.geojson'
        return response

    @drf_action(detail=False, methods=['GET'], name='Download All GeoJSON')
    def download_all(self, request):
        json_file = io.StringIO()
        features = []
        for id in self.request.GET.get('ids').replace('&','').split('id='):
            if id:
                sr = ServiceRequest.objects.get(id=id)
                features.append(sr.get_feature_json())

        data = {"features":features}
        data_string = json.dumps(data)
        json_file.write(data_string)
        json_file.seek(0)
        wrapper = FileWrapper(json_file)
        response = HttpResponse(wrapper, content_type='application/json')
        response['Content-Disposition'] = 'attachement; filename=SRs' + '.geojson'
        return response

    @drf_action(detail=True, methods=['GET'], name='Push GeoJSON')
    def push(self, request, pk=None):
        sr = ServiceRequest.objects.get(id=pk)
        success = True
        try:
            sr.push_json()
        except Exception as error:
            print ("Caltopo Error on SR#" + str(sr.id) + ": " + str(error))
            success = False
        data = {sr.id_for_incident: {'status': success}}
        return JsonResponse(data)

    @drf_action(detail=False, methods=['GET'], name='Push All GeoJSON')
    def push_all(self, request):
        data = {}
        for sr_id in self.request.GET.get('ids').replace('&','').split('id='):
            if sr_id:
                sr = ServiceRequest.objects.get(id=sr_id)
                success = True
                try:
                    sr.push_json()
                except:
                    success = False
                data[sr.id_for_incident] = {'status': success}
        return JsonResponse(data)

    @drf_action(detail=True, methods=['GET'], name='Remove from Active Dispatch')
    def remove_active(self, request, pk=None):
        from rest_framework import response
        sr = ServiceRequest.objects.get(id=pk)
        sr.followup_date=datetime.today()
        sr.save()
        for assigned_request in AssignedRequest.objects.filter(service_request=sr, dispatch_assignment__end_time=None):
            assigned_request.delete()
        sr.update_status(self.request.user)
        return response.Response(ServiceRequestSerializer(sr).data, status=200)

class VisitNoteViewSet(viewsets.ModelViewSet):

    queryset = VisitNote.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = VisitNoteSerializer

class ServiceRequestNoteViewSet(viewsets.ModelViewSet):

    queryset = ServiceRequestNote.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = ServiceRequestNoteSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():

            serializer.save()
            action.send(self.request.user, verb='added a note', target=ServiceRequest.objects.get(id=self.request.data.get('service_request')))
