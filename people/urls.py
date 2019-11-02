from django.contrib import admin
from django.urls import path
from people import views

app_name = 'people'

urlpatterns = [
    path('', views.owner_list, name='owner_list'),
    path('<int:pk>/delete', views.owner_delete, name='owner_delete'),
    path('<int:pk>/edit', views.owner_edit, name='owner_edit'),
    path('<int:pk>/', views.owner_detail, name='owner_detail'),
    path('owner/new/', views.owner_new, name='owner_new'),

]
