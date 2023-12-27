from datetime import datetime
from rest_framework import serializers
from django.db.models import Q

from .models import Exam, ExamAnswer, ExamQuestion, Diagnosis, PresentingComplaint, VetRequest, Treatment, TreatmentPlan, TreatmentRequest
from accounts.serializers import UserSerializer
from animals.serializers import SimpleAnimalSerializer

class ExamSerializer(serializers.ModelSerializer):

    answers = serializers.SerializerMethodField()

    def get_answers(self, obj):
        answer_dict = {}
        for examanswer in obj.examanswer_set.all():
            answer_dict[examanswer.question.name.lower().replace(' ','_').replace('/','_')] = examanswer.answer
            answer_dict[examanswer.question.name.lower().replace(' ','_').replace('/','_') + '_notes'] = examanswer.answer_notes
        return answer_dict

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


class DiagnosisSerializer(serializers.ModelSerializer):

    class Meta:
        model = Diagnosis
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
        return SimpleAnimalSerializer(obj.vet_request.patient, required=False, read_only=True).data

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
    animal_object = SimpleAnimalSerializer(source='patient', required=False, read_only=True)
    assignee_object = UserSerializer(source='assignee', required=False, read_only=True)
    exam_object = ExamSerializer(source='exam', required=False, read_only=True)
    treatment_plans = TreatmentPlanSerializer(source='treatmentplan_set', required=False, read_only=True, many=True)
    complaints_text = serializers.SerializerMethodField()
    diagnosis_text = serializers.SerializerMethodField()
    shelter_name = serializers.SerializerMethodField()

    class Meta:
        model = VetRequest
        fields = '__all__'

    def get_complaints_text(self, obj):
        return ', '.join(obj.presenting_complaints.all().values_list('name', flat=True))

    def get_diagnosis_text(self, obj):
        return obj.diagnosis.name if obj.diagnosis else ''

    def get_shelter_name(self, obj):
        return obj.patient.shelter.name if obj.patient.shelter else ''
