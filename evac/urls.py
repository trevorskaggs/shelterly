from django.urls import include, path
from rest_framework.routers import DefaultRouter

from evac import views

app_name = 'evac'
router = DefaultRouter()
router.register(r'evacteammember', views.EvacTeamMemberViewSet)
router.register(r'evacassignment', views.EvacAssignmentViewSet)
router.register(r'dispatchteam', views.DispatchTeamViewSet)

da_detail = views.EvacAssignmentViewSet.as_view({
  'get':'retrieve'
})

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/incident/<incident>/evacassignment/<id_for_incident>/', da_detail, name='da-detail')
]