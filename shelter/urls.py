from django.urls import path
from . import views

app_name = 'shelter'

urlpatterns = [
    path('', views.shelter_landing, name="shelter_landing"),
    path('list', views.shelter_list, name="shelter_list"),
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
]
