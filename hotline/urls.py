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
    path('', views.hotline_landing, name='hotline_landing'),
    path('request/list', views.service_request_list, name = 'service_request_list'),
    path('request/list-open', views.service_request_list_open, name = 'service_request_list_open'),
    path('request/list-closed', views.service_request_list_closed, name = 'service_request_list_closed'),
    path('reporter/new', views.hotline_new_reporter, name = 'hotline_new_reporter'),
    path('owner/new', views.hotline_new_owner, name='hotline_new_owner'),
    path('owner/<rep_pk>/new', views.hotline_new_owner, name = 'hotline_new_owner'),
    path('request/<int:owner_pk>/<int:rep_pk>/new', views.service_request_new, name = 'service_request_new'),
    path('request/<int:owner_pk>/new', views.service_request_new, name = 'service_request_new'),
    path('request/<int:service_request_pk>/', views.service_request_detail, name = 'service_request_detail'),
    path('request/<int:service_request_pk>/edit', views.service_request_edit, name = 'service_request_edit'),
    path('request/<service_request_pk>/animal/<species>/new', views.hotline_new_animal, name = "hotline_new_animal"),
]
