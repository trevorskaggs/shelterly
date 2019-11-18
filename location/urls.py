from django.contrib import admin
from django.urls import path
from location import views

app_name = 'location'

urlpatterns = [
    path('<object_type>/<object_pk>/', views.get_location_wkts, name='get_location_wkts'),
]
