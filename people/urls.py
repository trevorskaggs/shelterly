from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from people import views

app_name = 'people'
router = DefaultRouter()
router.register(r'person', views.PersonViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
