from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'vet'
router = DefaultRouter()
router.register(r'vet', views.VetViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
