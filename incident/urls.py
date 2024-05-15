from django.urls import include, path
from rest_framework.routers import DefaultRouter

from incident import views

app_name = 'incident'
router = DefaultRouter()
router.register(r'incident', views.IncidentViewSet)
router.register(r'organization', views.OrganizationViewSet)
router.register(r'tempaccess', views.TemporaryAccessViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
