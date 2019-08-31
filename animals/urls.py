from django.urls import path
from . import views

app_name = 'animals'

urlpatterns = [
    path('<int:pk>/', views.animal_detail, name='animal_detail'),
    path('<int:pk>/delete', views.animal_delete, name='animal_delete'),
    path('<int:pk>/edit', views.animal_edit, name="animal_edit"),
    #path('owner/<owner_pk>/animal', views.owner_animal_landing, name='owner_animal_landing'),
    path('', views.animal_list, name="animal_list"),
    path('<species>/new', views.new_animal, name='new_animal'),
    path('<species>/<pk>/new', views.new_owned_animal, name='new_owned_animal'),
]
