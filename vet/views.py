from datetime import datetime, timedelta
from rest_framework import filters, permissions, viewsets

from animals.models import Animal
from vet.models import Diagnosis, Diagnostic, DiagnosticResult, Exam, ExamAnswer, ExamQuestion, MedicalRecord, PresentingComplaint, Procedure, ProcedureResult, Treatment, TreatmentPlan, TreatmentRequest, VetRequest
from vet.serializers import DiagnosisSerializer, DiagnosticSerializer, DiagnosticResultSerializer, ExamQuestionSerializer, ExamSerializer, MedicalRecordSerializer, PresentingComplaintSerializer, ProcedureSerializer, ProcedureResultSerializer, TreatmentSerializer, TreatmentPlanSerializer, TreatmentRequestSerializer, VetRequestSerializer

class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = MedicalRecordSerializer

    def get_queryset(self):
        """
        Returns: Queryset of medical records.
        """
        queryset = (
            MedicalRecord.objects.all()
            .prefetch_related("exam_set")
            .prefetch_related("diagnosticresult_set")
            .prefetch_related("treatmentplan_set")
            .prefetch_related("vetrequest_set")
            .prefetch_related("procedureresult_set")
            .select_related("patient")
            # .order_by('order')
        )
        # if self.request.GET.get('incident'):
        #     queryset = queryset.filter(incident__slug=self.request.GET.get('incident'))
        return queryset

    def perform_update(self, serializer):
        if serializer.is_valid():
            med_record = serializer.save()
            # Create DiagnosticResults if we receive diagnostic data.
            for id in self.request.data.get('diagnostics', []):
                diagnostic = Diagnostic.objects.get(id=id)
                # Use submitted name for Other option.
                name = self.request.data.get('diagnostics_other', '') if diagnostic.name == 'Other' else ''
                DiagnosticResult.objects.create(diagnostic=diagnostic, medical_record=med_record, other_name=name)

            # Create ProcedureResults if we receive procedure data.
            for id in self.request.data.get('procedures', []):
                procedure = Procedure.objects.get(id=id)
                # Use submitted name for Other option.
                name = self.request.data.get('procedure_other', '') if procedure.name == 'Other' else ''
                ProcedureResult.objects.create(procedure=procedure, medical_record=med_record, other_name=name)


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = ExamSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():
            med_record = MedicalRecord.objects.get(id=self.request.data.get('medrecord_id'))
            serializer.validated_data['medical_record'] = med_record
            exam = serializer.save()
            # Close open vet requests once Exam is complete.
            VetRequest.objects.filter(medical_record=self.request.data.get('medrecord_id')).update(status='Closed')
            # Update Animal with animal data.
            Animal.objects.filter(id=self.request.data.get('animal_id')).update(age=self.request.data.get('age'), sex=self.request.data.get('sex'), microchip=self.request.data.get('microchip', ''))
            # Create ExamAnswer objects.
            for k,v in self.request.data.items():
                if k not in ['open', 'assignee', 'age', 'sex', 'microchip', 'confirm_sex_age', 'confirm_chip', 'temperature', 'temperature_method', 'weight', 'weight_unit', 'weight_estimated', 'pulse', 'respiratory_rate'] and '_notes' not in k and '_id' not in k and self.request.data.get(k + '_id'):
                    ExamAnswer.objects.create(exam=exam, question=ExamQuestion.objects.get(id=self.request.data.get(k + '_id', '')), answer=v, answer_notes=self.request.data.get(k + '_notes', ''))

    def perform_update(self, serializer):
        if serializer.is_valid():
            exam = serializer.save()
            Animal.objects.filter(id=self.request.data.get('animal_id')).update(age=self.request.data.get('age'), sex=self.request.data.get('sex'), microchip=self.request.data.get('microchip', ''))
            for k,v in self.request.data.items():
                if k not in ['open', 'assignee', 'age', 'sex', 'microchip', 'confirm_sex_age', 'confirm_chip', 'temperature', 'temperature_method', 'weight', 'weight_unit', 'weight_estimated', 'pulse', 'respiratory_rate'] and '_notes' not in k and '_id' not in k and self.request.data.get(k + '_id'):
                    ExamAnswer.objects.update_or_create(exam=exam, question=ExamQuestion.objects.get(id=self.request.data.get(k + '_id')), defaults={'answer':v, 'answer_notes':self.request.data.get(k + '_notes', '')})


class ExamQuestionViewSet(viewsets.ModelViewSet):
    queryset = ExamQuestion.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = ExamQuestionSerializer


class PresentingComplaintViewSet(viewsets.ModelViewSet):
    queryset = PresentingComplaint.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = PresentingComplaintSerializer


class ProcedureViewSet(viewsets.ModelViewSet):
    queryset = Procedure.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = ProcedureSerializer


class TreatmentViewSet(viewsets.ModelViewSet):
    queryset = Treatment.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = TreatmentSerializer


class DiagnosisViewSet(viewsets.ModelViewSet):
    queryset = Diagnosis.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = DiagnosisSerializer


class DiagnosticViewSet(viewsets.ModelViewSet):
    queryset = Diagnostic.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = DiagnosticSerializer


class DiagnosticResultViewSet(viewsets.ModelViewSet):
    queryset = DiagnosticResult.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = DiagnosticResultSerializer

    def perform_update(self, serializer):

        if serializer.is_valid():
            if serializer.validated_data.get('result', False) and not serializer.validated_data.get('complete', False):
                serializer.validated_data['complete'] = datetime.now()
            elif not serializer.validated_data.get('result', False) and serializer.validated_data.get('complete', False):
                serializer.validated_data['complete'] = None

            serializer.save()


class ProcedureResultViewSet(viewsets.ModelViewSet):
    queryset = ProcedureResult.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = ProcedureResultSerializer


class TreatmentRequestViewSet(viewsets.ModelViewSet):
    queryset = TreatmentRequest.objects.all()
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = TreatmentRequestSerializer


class VetRequestViewSet(viewsets.ModelViewSet):
    queryset = VetRequest.objects.all()
    search_fields = ['id', 'medical_record__patient__id', 'medical_record__patient__name', 'concern', 'presenting_complaints__name']
    filter_backends = (filters.SearchFilter,)
    permission_classes = [permissions.IsAuthenticated, ]
    serializer_class = VetRequestSerializer

    def get_queryset(self):
        """
        Returns: Queryset of distinct animals, each annotated with:
            images (List of AnimalImages)
        """
        queryset = (
            VetRequest.objects.exclude(status="CANCELED").distinct()
            # .prefetch_related("owners")
            .select_related("medical_record", "medical_record__patient")
            # .order_by('order')
        )
        if self.request.GET.get('incident'):
            queryset = queryset.filter(medical_record__patient__incident__slug=self.request.GET.get('incident'))
        return queryset

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.validated_data['requested_by'] = self.request.user
            med_record, _ = MedicalRecord.objects.get_or_create(patient=Animal.objects.get(id=self.request.data.get('patient')))
            serializer.validated_data['medical_record'] = med_record
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

            # Create proper number of TreatmentRequests
            for interval in range(int(24/treatment_plan.frequency) * treatment_plan.days):
                TreatmentRequest.objects.create(treatment_plan=treatment_plan, suggested_admin_time=treatment_plan.start + timedelta(hours=interval*treatment_plan.frequency))
