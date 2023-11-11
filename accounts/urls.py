from django.conf.urls import url
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from accounts import views

app_name = 'accounts'
router = DefaultRouter()
router.register(r'user', views.UserViewSet)

urlpatterns = [
    url("^api/user/auth/$", views.UserAuth.as_view()),
    url('^api/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('api/', include(router.urls)),
]
