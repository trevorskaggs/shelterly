from django.contrib import admin
from django.urls import path

from evac import views

app_name = 'evac'

urlpatterns = [
    path('', views.evac_landing, name ='evac_landing'),
    path('teammember/new', views.team_member, name='new_team_member'),
    path('teammember/<int:pk>', views.team_member, name='edit_team_member'),
    path('evacteam/new', views.evac_team, name='new_evac_team'),
    path('evacteam/<int:pk>', views.team_member, name='edit_evac_team'),
]