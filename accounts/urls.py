from django.conf.urls import url
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from accounts import views

app_name = 'accounts'
router = DefaultRouter()
router.register(r'user', views.UserViewSet)

urlpatterns = [
    url("^api/user/auth/$", views.UserAuth.as_view()),
    path('api/', include(router.urls)),
]
