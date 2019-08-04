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
from django.urls import path
from . import views

app_name = 'animals'

urlpatterns = [
    path('<int:pk>/', views.animal_detail, name='animal_detail'),
    path('<int:pk>/delete', views.animal_delete, name='animal_delete'),
    path('<int:pk>/edit', views.animal_edit, name="animal_edit"),
    #path('owner/<owner_pk>/animal', views.owner_animal_landing, name='owner_animal_landing'),
    path('', views.animal_list, name="animal_list"),
    path('<species>/new', views.new_animal, name='new_animal'),
    path('<species>/<pk>/new', views.new_owned_animal, name='new_owned_animal'),
]
