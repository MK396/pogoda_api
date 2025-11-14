from django.urls import path
from . import views

urlpatterns = [
    path('', views.pogoda_list, name='pogoda_list'),
]
