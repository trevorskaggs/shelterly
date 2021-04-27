from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'animals'
router = DefaultRouter()
router.register(r'animal', views.AnimalViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('print', views.print_kennel_card, name="print_kennel_card"),
]
