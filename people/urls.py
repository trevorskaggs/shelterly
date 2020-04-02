from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from people import views

app_name = 'people'
router = DefaultRouter()
router.register(r'teammember', views.TeamMemberViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('<int:pk>/delete', views.owner_delete, name='owner_delete'),
    path('<int:pk>/edit', views.owner, name='owner_edit'),
    path('<int:pk>/', views.owner_detail, name='owner_detail'),
]
