from django.contrib import admin

from vet.models import Diagnosis, Exam, ExamQuestion, MedicalRecord, Procedure, Treatment, TreatmentRequest, PresentingComplaint, VetRequest

class ExamQuestionAdmin(admin.ModelAdmin):
  list_display = ('id', 'name', 'default',)

class MedicalRecordAdmin(admin.ModelAdmin):
  list_display = ('id', 'patient',)

class VetRequestAdmin(admin.ModelAdmin):
  list_display = ('id', 'requested_by', 'medical_record',)

class TreatmentAdmin(admin.ModelAdmin):
  list_display = ('id', 'description', 'category',)

class TreatmentRequestAdmin(admin.ModelAdmin):
  list_display = ('id', 'treatment', 'treatment_plan', 'suggested_admin_time', 'actual_admin_time',)

class PresentingComplaintAdmin(admin.ModelAdmin):
  list_display = ('id', 'name',)

class ProcedureAdmin(admin.ModelAdmin):
  list_display = ('id', 'name',)

# Register your models here.
admin.site.register(VetRequest, VetRequestAdmin)
admin.site.register(MedicalRecord, MedicalRecordAdmin)
admin.site.register(ExamQuestion, ExamQuestionAdmin)
admin.site.register(Diagnosis)
admin.site.register(Exam)
admin.site.register(Treatment, TreatmentAdmin)
admin.site.register(TreatmentRequest, TreatmentRequestAdmin)
admin.site.register(PresentingComplaint, PresentingComplaintAdmin)
admin.site.register(Procedure, ProcedureAdmin)
