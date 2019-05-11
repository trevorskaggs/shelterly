from django.contrib import admin
from django.urls import path

from evac import views

app_name = 'evac'

urlpatterns = [
    path('', views.evac_landing, name ='evac_landing'),
]