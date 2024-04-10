from django.urls import include, path, re_path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'animals'
router = DefaultRouter()
router.register(r'animal', views.AnimalViewSet)
router.register(r'species', views.SpeciesViewSet)

animal_detail = views.AnimalViewSet.as_view({
  'get':'retrieve'
})

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/incident/<incident>/animal/<id_for_incident>/', animal_detail, name='animal-detail')
]
