from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'vet'
router = DefaultRouter()
router.register(r'vetrequest', views.VetRequestViewSet)
router.register(r'treatment', views.TreatmentViewSet)
router.register(r'treatmentplan', views.TreatmentPlanViewSet)
router.register(r'treatmentrequest', views.TreatmentRequestViewSet)
router.register(r'complaints', views.PresentingComplaintViewSet)
router.register(r'diagnosis', views.DiagnosisViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
