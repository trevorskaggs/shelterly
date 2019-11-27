from django.urls import path
from . import views

app_name = 'shelter'

urlpatterns = [
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
    path('room/<int:room_pk>/cage', views.cage, name='cage'),
    path('room/<int:room_pk>/cage/<int:pk>', views.cage, name='cage'),
    path('cage/<int:pk>/', views.cage_detail, name='cage_detail'),
    path('<obj_type>/<int:pk>/delete', views.shelter_object_delete, name='shelter_object_delete'),

    # Animal Placement URLs
    path('<int:animal_pk>/shelter', views.shelter_animal_shelter_select, name='shelter_animal_shelter_select'),
    path('<int:animal_pk>/<int:shelter_pk>/buildings', views.shelter_animal_building_select, name='shelter_animal_building_select'),
    path('<int:animal_pk>/<int:building_pk>/rooms', views.shelter_animal_room_select, name='shelter_animal_room_select'),
    path('<int:animal_pk>/<int:room_pk>/cages', views.shelter_animal_cage_select, name='shelter_animal_cage_select'),
    path('<int:animal_pk>/<int:room_pk>/cage/add', views.shelter_animal_cage_add, name='shelter_animal_cage_add'),
    path('<int:animal_pk>/<int:cage_pk>/', views.shelter_animal_cage, name='shelter_animal_cage'),

]
