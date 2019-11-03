import views
import settings
from django.contrib import admin
from django.urls import path
from django.conf.urls import include
from django.contrib.staticfiles.urls import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
 
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.home, name="home"),
    path('animals/', include('animals.urls')),
    path('evac/', include('evac.urls')),
    path('hotline/', include('hotline.urls')),
    path('intake/', include('intake.urls')),
    # path('location/', include('location.urls')),
    path('people/', include('people.urls')),
    path('shelter/', include('shelter.urls')),
]
urlpatterns += staticfiles_urlpatterns()
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)