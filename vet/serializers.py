from rest_framework import serializers

from .models import PresentingComplaint, VetRequest, Treatment, TreatmentPlan, TreatmentRequest
from accounts.serializers import UserSerializer
from animals.serializers import SimpleAnimalSerializer

class PresentingComplaintSerializer(serializers.ModelSerializer):

    class Meta:
        model = PresentingComplaint
        fields = '__all__'


class TreatmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Treatment
        fields = '__all__'


class TreatmentRequestSerializer(serializers.ModelSerializer):

    class Meta:
        model = TreatmentRequest
        fields = '__all__'


class TreatmentPlanSerializer(serializers.ModelSerializer):

    treatment_object = TreatmentSerializer(source='treatment', required=False, read_only=True)
    treatment_requests = TreatmentRequestSerializer(source='treatmentrequest_set', required=False, read_only=True, many=True)

    class Meta:
        model = TreatmentPlan
        fields = '__all__'


class VetRequestSerializer(serializers.ModelSerializer):
    animal_object = SimpleAnimalSerializer(source='patient', required=False, read_only=True)
    assignee_object = UserSerializer(source='assignee', required=False, read_only=True)
    treatment_plans = TreatmentPlanSerializer(source='treatmentplan_set', required=False, read_only=True, many=True)
    complaints_text = serializers.SerializerMethodField()

    class Meta:
        model = VetRequest
        fields = '__all__'

    def get_complaints_text(self, obj):
        return ', '.join(obj.presenting_complaints.all().values_list('name', flat=True))