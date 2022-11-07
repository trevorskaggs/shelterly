import views
import settings
from rest_framework import permissions
from django.contrib import admin
from django.views.static import serve
from django.urls import path, re_path
from django.conf.urls import include, url
from django.contrib.staticfiles.urls import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from knox import views as knox_views
from accounts.views import LoginView
from animals.views import print_kennel_card
from evac.views import download_geojson
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="Snippets API",
      default_version='v1',
      description="Test description",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="contact@snippets.local"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=[],
)
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name="home"),
    path('accounts/', include('accounts.urls')),
    path('animals/', include('animals.urls')),
    path('evac/', include('evac.urls')),
    path('hotline/', include('hotline.urls')),
    path('incident/', include('incident.urls')),
    path('location/', include('location.urls')),
    path('people/', include('people.urls')),
    path('reports/', include('reports.urls')),
    path('shelter/', include('shelter.urls')),
    path('activity/', include('actstream.urls')),
    url(r'login/', LoginView.as_view(), name='knox_login'),
    url(r'logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
]
urlpatterns.append(path('<str:incident>/animals/print/<int:animal_id>', print_kennel_card, name="print_kennel_card"))
urlpatterns.append(path('<str:incident>/dispatch/download/<int:dispatch_id>', download_geojson, name="download_geojson"))
if settings.USE_S3:
    urlpatterns.append(re_path(u'static/(?P<path>.*)$', views.static_url))
#To use local static files both USE_S3 must be FALSE and DEBUG must be TRUE!
elif not settings.USE_S3 and settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns.append(url(r'^(?:.*)/?$', views.home))
