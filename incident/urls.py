from django.conf.urls import url
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from incident import views

app_name = 'incident'
router = DefaultRouter()
router.register(r'incident', views.IncidentViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
