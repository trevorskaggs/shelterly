from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from evac import views

app_name = 'evac'
router = DefaultRouter()
router.register(r'evacteam', views.EvacTeamViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]