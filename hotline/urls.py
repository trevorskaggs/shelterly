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

from hotline import views

app_name = 'hotline'

urlpatterns = [
    path('startcall', views.start_call, name ='start_call'),
    path('startcall/<evac_request>/owner_new', views.hotline_new_owner, name = 'hotline_new_owner'),
    path('starcall/<evac_request>/<int:pk>/edit', views.evac_request_edit, name = 'evac_request_edit'),
    path('starcall/<evac_request>/<int:pk>', views.evac_request, name = 'evac_request'),
    path('startcall/<evac_request>/<int:pk>/<species>/new', views.hotline_new_animal, name="hotline_new_animal"),
    path('', views.hotline_landing, name='hotline_landing'),
]
