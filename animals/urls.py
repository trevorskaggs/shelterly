from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'animals'
router = DefaultRouter()
router.register(r'animal', views.AnimalViewSet)
router.register(r'species', views.SpeciesViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
