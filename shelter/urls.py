from django.urls import path, include
from shelter import views

app_name = 'shelter'
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'shelter', views.ShelterViewSet)
router.register(r'building', views.BuildingViewSet, basename='building')
router.register(r'room', views.RoomViewSet, basename='room')
# router.register('buildings/shelter/<int:shelter>', views.BuildingFilteredView)

urlpatterns = [
    path('api/', include(router.urls)),
]
