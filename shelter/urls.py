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
    path('', views.shelter_landing, name="shelter_landing"),
    path('list', views.shelter_list, name="shelter_list"),
    #Shelter Management URLs
    path('new', views.shelter, name='shelter'),
    path('<int:pk>/edit/', views.shelter, name='shelter'),
    path('<int:pk>/', views.shelter_detail, name='shelter_detail'),
    path('<int:shelter_pk>/building/', views.building, name='building'),
    path('<int:shelter_pk>/building/<int:pk>', views.building, name='building'),
    path('building/<int:pk>/', views.building_detail, name='building_detail'),
    path('building/<int:building_pk>/room', views.room, name='room'),
    path('building/<int:building_pk>/room/<int:pk>', views.room, name='room'),
    path('room/<int:pk>/', views.room_detail, name='room_detail'),
    path('<obj_type>/<int:pk>/delete', views.shelter_object_delete, name='shelter_object_delete'),

    # Animal Placement URLs
    path('<int:animal_pk>/shelter', views.shelter_animal_shelter_select, name='shelter_animal_shelter_select'),
    path('<int:animal_pk>/<int:shelter_pk>/buildings', views.shelter_animal_building_select, name='shelter_animal_building_select'),
    path('<int:animal_pk>/<int:building_pk>/rooms', views.shelter_animal_room_select, name='shelter_animal_room_select')

]
