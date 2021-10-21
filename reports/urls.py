from django.urls import include, path
from rest_framework.routers import DefaultRouter

from reports import views

app_name = 'reports'
router = DefaultRouter()
router.register(r'reports', views.ReportViewSet, basename="reports")

urlpatterns = [
    path('api/', include(router.urls)),
]
