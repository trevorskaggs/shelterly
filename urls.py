import views
import settings
from rest_framework import permissions
from django.contrib import admin
from django.views.static import serve
from django.urls import path
from django.conf.urls import include, url
from django.contrib.staticfiles.urls import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from knox import views as knox_views
from accounts.views import LoginView
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
    path('intake/', include('intake.urls')),
    path('location/', include('location.urls')),
    path('people/', include('people.urls')),
    path('shelter/', include('shelter.urls')),
    path('activity/', include('actstream.urls')),
    url(r'login/', LoginView.as_view(), name='knox_login'),
    url(r'logout/', knox_views.LogoutView.as_view(), name='knox_logout'),
]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += [url(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
   url(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
   url(r'^redoc/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc')]
urlpatterns += [url(r'^silk/', include('silk.urls', namespace='silk'))]

urlpatterns.append(url(r'^(?:.*)/?$', views.home))

if settings.DEBUG:
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += [url(r'^media/(?P<path>.*)$', serve, {'document_root':settings.MEDIA_ROOT})]
