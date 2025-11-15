from django.urls import path
from . import views

urlpatterns = [
    # 1. Główna strona z listą aktualnej pogody
    path('', views.pogoda_list, name='pogoda_list'),
    path('fetch-weather/', views.fetch_weather_view, name='fetch_weather'),
    # 2. Nowa strona z historią pogody dla danego miasta
    # <str:city_name> przechwyci to, co jest w URL, jako zmienną city_name
    path('history/<str:city_name>/', views.city_detail, name='city_detail'),
]