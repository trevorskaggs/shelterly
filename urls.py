import views
import settings
from django.contrib import admin
from django.views.static import serve
from django.urls import path
from django.conf.urls import include, url
from django.contrib.staticfiles.urls import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from knox import views as knox_views
from accounts.views import LoginView

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
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns.append(url(r'^(?:.*)/?$', views.home))

if settings.DEBUG:
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += [url(r'^media/(?P<path>.*)$', serve, {'document_root':settings.MEDIA_ROOT})]
