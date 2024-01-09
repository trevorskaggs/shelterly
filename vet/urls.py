from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'vet'
router = DefaultRouter()
router.register(r'vetrequest', views.VetRequestViewSet)
router.register(r'medrecord', views.MedicalRecordViewSet)
router.register(r'treatment', views.TreatmentViewSet)
router.register(r'treatmentplan', views.TreatmentPlanViewSet)
router.register(r'treatmentrequest', views.TreatmentRequestViewSet)
router.register(r'complaints', views.PresentingComplaintViewSet)
router.register(r'diagnosis', views.DiagnosisViewSet)
router.register(r'diagnostics', views.DiagnosticViewSet)
router.register(r'diagnosticresults', views.DiagnosticResultViewSet)
router.register(r'procedures', views.ProcedureViewSet)
router.register(r'exam', views.ExamViewSet)
router.register(r'examquestions', views.ExamQuestionViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
