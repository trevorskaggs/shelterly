from django.contrib import admin
from django.urls import path

from evac import views
from people.views import team_member

app_name = 'evac'

urlpatterns = [
    path('', views.evac_landing, name ='evac_landing'),
    path('teammember/new', team_member, name='new_team_member'),
    path('teammember/<int:pk>/', team_member, name='edit_team_member'),
]