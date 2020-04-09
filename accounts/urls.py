from django.conf.urls import url
from . import views

app_name = 'accounts'

urlpatterns = [
    url("^auth/user/$", views.UserAPI.as_view()),
]



