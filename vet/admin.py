from django.contrib import admin

from vet.models import Diagnosis, Exam, ExamQuestion, MedicalRecord, Procedure, Treatment, TreatmentRequest, PresentingComplaint, VetRequest

@admin.register(ExamQuestion)
class ExamQuestionAdmin(admin.ModelAdmin):
  list_display = ('id', 'name', 'default',)

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
  list_display = ('id', 'patient',)

@admin.register(VetRequest)
class VetRequestAdmin(admin.ModelAdmin):
  list_display = ('id', 'requested_by', 'medical_record',)

@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
  list_display = ('id', 'description', 'category',)

@admin.register(TreatmentRequest)
class TreatmentRequestAdmin(admin.ModelAdmin):
  list_display = ('id', 'treatment', 'treatment_plan', 'suggested_admin_time', 'actual_admin_time',)

@admin.register(PresentingComplaint)
class PresentingComplaintAdmin(admin.ModelAdmin):
  list_display = ('id', 'name',)

@admin.register(Procedure)
class ProcedureAdmin(admin.ModelAdmin):
  list_display = ('id', 'name',)

# Register your models here.
admin.site.register(Diagnosis)
admin.site.register(Exam)
