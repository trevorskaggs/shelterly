from datetime import datetime, timedelta
from rest_framework import filters, permissions, viewsets

from vet.models import Diagnosis, Exam, ExamAnswer, ExamQuestion, PresentingComplaint, Treatment, TreatmentPlan, TreatmentRequest, VetRequest
from vet.serializers import DiagnosisSerializer, ExamQuestionSerializer, ExamSerializer, PresentingComplaintSerializer, TreatmentSerializer, TreatmentPlanSerializer, TreatmentRequestSerializer, VetRequestSerializer

class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = ExamSerializer

    # def get_queryset(self):
    #     """
    #     Returns: Queryset of distinct animals, each annotated with:
    #         images (List of AnimalImages)
    #     """
    #     queryset = (
    #         Exam.objects.all()
    #     )

    def perform_create(self, serializer):
        if serializer.is_valid():
            exam = serializer.save()
            VetRequest.objects.filter(id=self.request.data.get('vetrequest_id')).update(exam=exam)
            for k,v in self.request.data.items():
                if k not in ['confirm_sex_age', 'confirm_chip', 'temperature', 'temperature_method', 'weight', 'weight_unit'] and '_notes' not in k and '_id' not in k and self.request.data.get(k + '_id'):
                    ExamAnswer.objects.create(exam=exam, question=ExamQuestion.objects.get(id=self.request.data.get(k + '_id', '')), answer=v, answer_notes=self.request.data.get(k + '_notes', ''))

    def perform_update(self, serializer):
        if serializer.is_valid():
            exam = serializer.save()
            for k,v in self.request.data.items():
                if k not in ['confirm_sex_age', 'confirm_chip', 'temperature', 'temperature_method', 'weight', 'weight_unit'] and '_notes' not in k and '_id' not in k and self.request.data.get(k + '_id'):
                    ExamAnswer.objects.update_or_create(exam=exam, question=ExamQuestion.objects.get(id=self.request.data.get(k + '_id')), defaults={'answer':v, 'answer_notes':self.request.data.get(k + '_notes', '')})


class ExamQuestionViewSet(viewsets.ModelViewSet):
    queryset = ExamQuestion.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = ExamQuestionSerializer


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

    def perform_update(self, serializer):

        if serializer.is_valid():

            tr = serializer.save()

            # Check vet request to see if it needs to be closed.
            if tr.actual_admin_time:
                tr.treatment_plan.vet_request.check_closed()


class VetRequestViewSet(viewsets.ModelViewSet):
    queryset = VetRequest.objects.all()
    search_fields = ['id', 'assignee__first_name', 'assignee__last_name', 'patient__shelter__name', 'patient__species', 'priority', 'open', 'treatmentplan__treatment__description']
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = VetRequestSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():

            # Mark assigned date if we have an assignee.
            if serializer.validated_data.get('assignee'):
                serializer.validated_data['assigned'] = datetime.now()
                serializer.validated_data['status'] = 'Assigned'

            serializer.save()

    def perform_update(self, serializer):

        if serializer.is_valid():

            # Mark assigned date if we have an assignee and it is different from current assignee value.
            if serializer.validated_data.get('assignee') and serializer.instance.assignee != serializer.validated_data.get('assignee'):
                serializer.validated_data['assigned'] = datetime.now()
                serializer.validated_data['status'] = 'Assigned'
            elif serializer.instance.assignee and not serializer.validated_data.get('assignee'):
                serializer.validated_data['assigned'] = None
                serializer.validated_data['status'] = 'Open'

            serializer.save()

    # def get_queryset(self):
    #     """
    #     Returns: Queryset of distinct animals, each annotated with:
    #         images (List of AnimalImages)
    #     """
    #     queryset = (
    #         VetRequest.objects.exclude(status="CANCELED").distinct()
    #         .prefetch_related("owners")
    #         .select_related("reporter", "room", "request", "shelter")
    #         .order_by('order')
    #     )
    #     if self.request.GET.get('incident'):
    #         queryset = queryset.filter(incident__slug=self.request.GET.get('incident'))
    #     return queryset


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

            for hours in range(int(total_hours / treatment_plan.frequency) + 1):
                TreatmentRequest.objects.create(treatment_plan=treatment_plan, suggested_admin_time=treatment_plan.start + timedelta(hours=hours*treatment_plan.frequency))

            # If we have a new TP then the vet request cannot be closed.
            treatment_plan.vet_request.closed = None
            treatment_plan.vet_request.save()
