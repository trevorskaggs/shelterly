from django.contrib import admin

from vet.models import Diagnosis, ExamQuestion, MedicalRecord, Treatment, TreatmentPlan, TreatmentRequest, PresentingComplaint, VetRequest

class MedicalRecordAdmin(admin.ModelAdmin):
  list_display = ('id', 'patient', 'exam',)

class VetRequestAdmin(admin.ModelAdmin):
  list_display = ('id', 'requested_by',)

class TreatmentPlanAdmin(admin.ModelAdmin):
  list_display = ('id', 'medical_record', 'treatment',)

class TreatmentAdmin(admin.ModelAdmin):
  list_display = ('id', 'description', 'category',)

class TreatmentRequestAdmin(admin.ModelAdmin):
  list_display = ('id', 'suggested_admin_time',)

class PresentingComplaintAdmin(admin.ModelAdmin):
  list_display = ('id', 'name',)

# Register your models here.
admin.site.register(VetRequest, VetRequestAdmin)
admin.site.register(MedicalRecord, MedicalRecordAdmin)
admin.site.register(ExamQuestion)
admin.site.register(Diagnosis)
admin.site.register(TreatmentPlan, TreatmentPlanAdmin)
admin.site.register(Treatment, TreatmentAdmin)
admin.site.register(TreatmentRequest, TreatmentRequestAdmin)
admin.site.register(PresentingComplaint, PresentingComplaintAdmin)
