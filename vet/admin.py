from django.contrib import admin

from vet.models import Diagnosis, Exam, ExamQuestion, MedicalRecord, Treatment, TreatmentPlan, TreatmentRequest, PresentingComplaint, VetRequest

@admin.register(ExamQuestion)
class ExamQuestionAdmin(admin.ModelAdmin):
  list_display = ('id', 'name', 'default',)

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
  list_display = ('id', 'patient', 'exam',)

@admin.register(VetRequest)
class VetRequestAdmin(admin.ModelAdmin):
  list_display = ('id', 'requested_by', 'medical_record',)

@admin.register(TreatmentPlan)
class TreatmentPlanAdmin(admin.ModelAdmin):
  list_display = ('id', 'medical_record', 'treatment',)

@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
  list_display = ('id', 'description', 'category',)

@admin.register(TreatmentRequest)
class TreatmentRequestAdmin(admin.ModelAdmin):
  list_display = ('id', 'suggested_admin_time',)

@admin.register(PresentingComplaint)
class PresentingComplaintAdmin(admin.ModelAdmin):
  list_display = ('id', 'name',)

# Register your models here.
admin.site.register(Diagnosis)
admin.site.register(Exam)
