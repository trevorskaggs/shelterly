from django.urls import path, include
from rest_framework.routers import DefaultRouter
from shelter import views
app_name = 'shelter'

router = DefaultRouter()
router.register(r'shelter', views.ShelterViewSet, basename='shelter')
router.register(r'building', views.BuildingViewSet, basename='building')
router.register(r'room', views.RoomViewSet, basename='room')

urlpatterns = [
    path('api/', include(router.urls)),
]
