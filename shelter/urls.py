from django.urls import path
from . import views

app_name = 'shelter'

urlpatterns = [
    path('', views.shelter_list, name="shelter_list"),
    path('<int:pk>/', views.shelter_detail, name='shelter_detail'),
    path('building/<int:pk>/', views.building_detail, name='building_detail'),
    path('room/<int:pk>/', views.room_detail, name='room_detail'),
    path('cage/<int:pk>/', views.cage_detail, name='cage_detail'),
]
