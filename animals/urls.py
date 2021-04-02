from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'animals'
router = DefaultRouter()
router.register(r'animal', views.AnimalViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('print', views.kennel_card_print, name="print"),
]
