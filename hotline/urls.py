from django.urls import include, path

from hotline import views
from rest_framework.routers import DefaultRouter



app_name = 'hotline'
router = DefaultRouter()
router.register(r'servicerequests', views.ServiceRequestViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
