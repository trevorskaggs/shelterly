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
    path('evacreq/list', views.evac_request_list, name = 'evac_request_list'),
    path('reporter/new', views.hotline_new_reporter, name = 'hotline_new_reporter'),
    path('owner/<rep_pk>/new', views.hotline_new_owner, name = 'hotline_new_owner'),
    path('evacreq/<int:owner_pk>/<rep_pk>/new', views.evac_request_new, name = 'evac_request_new'),
    path('evacreq/<int:evac_req_pk>/', views.evac_request_detail, name = 'evac_request_detail'),
    path('evacreq/<int:evac_req_pk>/edit', views.evac_request_edit, name = 'evac_request_edit'),
    path('evacreq/<evac_req_pk>/animal/<species>/new', views.hotline_new_animal, name = "hotline_new_animal"),
]
