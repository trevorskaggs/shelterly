"""RAMS_SKELETON URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from . import views


app_name = 'people'

urlpatterns = [
    path('', views.owner_list, name='owner_list'),
    path('<int:pk>/delete', views.owner_delete, name='owner_delete'),
    path('<int:pk>/edit', views.owner_edit, name='owner_edit'),
    path('<int:pk>/', views.owner_detail, name='owner_detail'),
    path('owner/new/', views.owner_new, name='owner_new'),

]
