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

app_name = 'people'

urlpatterns = [
    path('<int:pk>/delete', views.OwnerDeleteView.as_view(), name='owner_delete'),
    path('<int:pk>/', views.OwnerDetailView.as_view(), name='owner_detail'),
    path('new/', views.OwnerNewView.as_view(), name='owner_new'),
    path('<int:pk>/edit', views.OwnerEditView.as_view(), name='owner_edit'),
    path('', views.OwnerListView.as_view(), name='owner_list'),
]
