from django.urls import include, path
from rest_framework.routers import DefaultRouter

from evac import views

app_name = 'evac'
router = DefaultRouter()
router.register(r'evacteammember', views.EvacTeamMemberViewSet)
router.register(r'evacassignment', views.EvacAssignmentViewSet)
router.register(r'dispatchteam', views.DispatchTeamViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('dispatch/print', views.dispatch_print, name="print"),
]