from django.urls import path
from . import views

urlpatterns = [
    # Widok API dla najnowszych danych (GET /api/pogoda/)
    path('api/pogoda/', views.latest_weather_list_api, name='api_weather_list'),

    # Stary widok dla historii, który zmienimy w następnym kroku
    path('api/pogoda/history/<str:city_name>/', views.city_detail_api, name='api_city_detail'),

    # Usuń lub zakomentuj starą ścieżkę do pogoda_list
    # path('', views.pogoda_list, name='pogoda_list'),
]