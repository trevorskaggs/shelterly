from datetime import timedelta
from rest_framework import filters, permissions, viewsets

from vet.models import Diagnosis, PresentingComplaint, Treatment, TreatmentPlan, TreatmentRequest, VetRequest
from vet.serializers import DiagnosisSerializer, PresentingComplaintSerializer, TreatmentSerializer, TreatmentPlanSerializer, TreatmentRequestSerializer, VetRequestSerializer

class PresentingComplaintViewSet(viewsets.ModelViewSet):
    queryset = PresentingComplaint.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = PresentingComplaintSerializer


class TreatmentViewSet(viewsets.ModelViewSet):
    queryset = Treatment.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = TreatmentSerializer


class DiagnosisViewSet(viewsets.ModelViewSet):
    queryset = Diagnosis.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = DiagnosisSerializer


class TreatmentRequestViewSet(viewsets.ModelViewSet):
    queryset = TreatmentRequest.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = TreatmentRequestSerializer


class VetRequestViewSet(viewsets.ModelViewSet):
    queryset = VetRequest.objects.all()
    search_fields = ['id', 'assignee__first_name', 'assignee__last_name', 'patient__shelter__name', 'patient__species', 'priority', 'open']
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = VetRequestSerializer

    def perform_create(self, serializer):
        # import ipdb;ipdb.set_trace()
        if serializer.is_valid():

            serializer.save()


class TreatmentPlanViewSet(viewsets.ModelViewSet):
    queryset = TreatmentPlan.objects.all()
    # search_fields = ['id', 'assignee__first_name', 'assignee__last_name', 'patient__shelter__name', 'patient__species', 'priority', 'open']
    # filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = TreatmentPlanSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():

            treatment_plan = serializer.save()
            total_time = treatment_plan.end - treatment_plan.start
            total_hours = total_time.days * 24 + total_time.seconds // 3600
            # import ipdb;ipdb.set_trace()
            for hours in range(int(total_hours / treatment_plan.frequency) + 1):
                TreatmentRequest.objects.create(treatment_plan=treatment_plan, suggested_admin_time=treatment_plan.start + timedelta(hours=hours*treatment_plan.frequency))
