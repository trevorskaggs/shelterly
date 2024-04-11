from django.contrib import admin
from django.urls import include, path, re_path
from hotline import views
from rest_framework.routers import DefaultRouter

app_name = 'hotline'
router = DefaultRouter()
router.register(r'servicerequests', views.ServiceRequestViewSet)
router.register(r'visitnote', views.VisitNoteViewSet)

sr_detail = views.ServiceRequestViewSet.as_view({
  'get':'retrieve'
})

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/incident/<incident>/servicerequests/<id_for_incident>/', sr_detail, name='sr-detail')
]
