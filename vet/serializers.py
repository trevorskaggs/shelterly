from datetime import datetime
from rest_framework import serializers
from django.db.models import Q

from .models import Exam, ExamAnswer, ExamQuestion, Diagnosis, Diagnostic, DiagnosticResult, MedicalRecord, PresentingComplaint, Procedure, VetRequest, Treatment, TreatmentPlan, TreatmentRequest
from accounts.serializers import UserSerializer
from animals.serializers import ModestAnimalSerializer

class ExamAnswerSerializer(serializers.ModelSerializer):

    name = serializers.StringRelatedField(source='question', read_only=True)

    class Meta:
        model = ExamAnswer
        fields = '__all__'


class ExamSerializer(serializers.ModelSerializer):

    assignee_object = UserSerializer(source='assignee', required=False, read_only=True)
    answers = ExamAnswerSerializer(source='examanswer_set', required=False, read_only=True, many=True)

    class Meta:
        model = Exam
        fields = '__all__'


class ExamQuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExamQuestion
        fields = '__all__'


class PresentingComplaintSerializer(serializers.ModelSerializer):

    class Meta:
        model = PresentingComplaint
        fields = '__all__'


class TreatmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Treatment
        fields = '__all__'


class DiagnosticSerializer(serializers.ModelSerializer):

    class Meta:
        model = Diagnostic
        fields = '__all__'


class DiagnosticResultSerializer(serializers.ModelSerializer):

    name = serializers.StringRelatedField(source='diagnostic', read_only=True)
    animal_object = serializers.SerializerMethodField()

    def get_animal_object(self, obj):
        return ModestAnimalSerializer(obj.medical_record.patient, required=False, read_only=True).data

    class Meta:
        model = DiagnosticResult
        fields = '__all__'


class DiagnosisSerializer(serializers.ModelSerializer):

    class Meta:
        model = Diagnosis
        fields = '__all__'


class ProcedureSerializer(serializers.ModelSerializer):

    class Meta:
        model = Procedure
        fields = '__all__'


class SimpleTreatmentRequestSerializer(serializers.ModelSerializer):

    assignee_object = UserSerializer(source='assignee', required=False, read_only=True)

    class Meta:
        model = TreatmentRequest
        fields = '__all__'


class SimpleTreatmentPlanSerializer(serializers.ModelSerializer):

    treatment_object = TreatmentSerializer(source='treatment', required=False, read_only=True)
    animal_object = serializers.SerializerMethodField()

    def get_animal_object(self, obj):
        return ModestAnimalSerializer(obj.medical_record.patient, required=False, read_only=True).data

    class Meta:
        model = TreatmentPlan
        fields = '__all__'


class TreatmentRequestSerializer(SimpleTreatmentRequestSerializer):

    treatment_plan_object = SimpleTreatmentPlanSerializer(source='treatment_plan', required=False, read_only=True)


class TreatmentPlanSerializer(SimpleTreatmentPlanSerializer):

    treatment_requests = SimpleTreatmentRequestSerializer(source='treatmentrequest_set', required=False, read_only=True, many=True)
    status = serializers.SerializerMethodField()

    def get_status(self, obj):
        return "Complete" if obj.treatmentrequest_set.filter(Q(actual_admin_time__isnull=False) | Q(not_administered=True)).count() == obj.treatmentrequest_set.count() else "Awaiting" if obj.treatmentrequest_set.filter(suggested_admin_time__lte=datetime.now(), actual_admin_time__isnull=True).count() > 0 else "Scheduled"


class VetRequestSerializer(serializers.ModelSerializer):

    animal_object = serializers.SerializerMethodField()
    complaints_text = serializers.SerializerMethodField()
    requested_by_object = UserSerializer(source='requested_by', required=False, read_only=True)

    class Meta:
        model = VetRequest
        fields = '__all__'

    def get_complaints_text(self, obj):
        return ', '.join(obj.presenting_complaints.all().values_list('name', flat=True))

    def get_animal_object(self, obj):
        return ModestAnimalSerializer(obj.medical_record.patient).data

class MedicalRecordSerializer(serializers.ModelSerializer):

    animal_object = ModestAnimalSerializer(source='patient', required=False, read_only=True)
    exams = ExamSerializer(source='exam_set', many=True, required=False, read_only=True)
    diagnostic_objects = DiagnosticResultSerializer(source='diagnosticresult_set', many=True, required=False, read_only=True)
    treatment_plans = TreatmentPlanSerializer(source='treatmentplan_set', required=False, read_only=True, many=True)
    vet_requests = VetRequestSerializer(source='vetrequest_set', required=False, read_only=True, many=True)
    diagnosis_text = serializers.SerializerMethodField()

    def get_diagnosis_text(self, obj):
        diagnosis = obj.diagnosis.all().values_list('name', flat=True)
        if obj.diagnosis_other:
            list(diagnosis).insert(0, obj.diagnosis_other)
        return ', '.join(diagnosis)

    class Meta:
        model = MedicalRecord
        fields = '__all__'
