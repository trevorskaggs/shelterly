from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = 'animals'
router = DefaultRouter()
router.register(r'animals', views.AnimalViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('<int:pk>/', views.animal_detail, name='animal_detail'),
    path('<int:pk>/delete', views.animal_delete, name='animal_delete'),
    path('<int:pk>/edit', views.animal_edit, name="animal_edit"),
    path('<int:pk>/image-new', views.animal_image, name="animal_image"),
    #path('owner/<owner_pk>/animal', views.owner_animal_landing, name='owner_animal_landing'),
    path('', views.animal_list, name="animal_list"),
    path('<species>/new', views.new_animal, name='new_animal'),
    path('<species>/<owner_pk>/new', views.new_animal, name='new_animal'),
]
