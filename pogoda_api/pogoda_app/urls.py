# pogoda/urls.py (Używa widoków z DRF)
from django.urls import path

# Importujemy klasy widoków z pogoda/views.py
from .views import (
    LatestWeatherListAPI,  # Zastępuje latest_weather_list_api
    RefreshWeatherAPI,  # Zastępuje refresh_weather_api
    CityDetailAPI, # Zastępuje city_detail_api
    HourlyForecastAPI,
)

urlpatterns = [
    # USUNIĘCIE: Stary widok TemplateView nie jest już potrzebny,
    # ponieważ aplikacja React przejmuje routing frontendu.
    # path('', TemplateView.as_view(template_name='index.html'), name='home'),

    # API 1: Lista aktualnej pogody (z bazy)
    # Używa: LatestWeatherListAPI.as_view()
    path('api/pogoda/', LatestWeatherListAPI.as_view(), name='api_weather_list'),

    # API 2: Odświeżanie danych (pobieranie z API + zwracanie najnowszych)
    # Używa: RefreshWeatherAPI.as_view()
    path('api/pogoda/refresh/', RefreshWeatherAPI.as_view(), name='api_weather_refresh'),

    # API 3: Historia dla konkretnego miasta
    # Używa: CityDetailAPI.as_view()
    path('api/pogoda/history/<str:city_name>/', CityDetailAPI.as_view(), name='api_city_detail'),

    path('api/forecast/<str:city_name>/', HourlyForecastAPI.as_view(), name='api_forecast'),
]