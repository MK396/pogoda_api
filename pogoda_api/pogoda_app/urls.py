
from django.urls import path


from .views import (
    LatestWeatherListAPI,
    RefreshWeatherAPI,
    CityDetailAPI,
    HourlyForecastAPI,
)

urlpatterns = [
    # API 1: Lista aktualnej pogody (z bazy)
    # Używa: LatestWeatherListAPI.as_view()
    path('api/pogoda/', LatestWeatherListAPI.as_view(), name='api_weather_list'),

    # API 2: Odświeżanie danych (pobieranie z API + zwracanie najnowszych)
    # Używa: RefreshWeatherAPI.as_view()
    path('api/pogoda/refresh/', RefreshWeatherAPI.as_view(), name='api_weather_refresh'),

    # API 3: Historia dla konkretnego miasta
    # Używa: CityDetailAPI.as_view()
    path('api/pogoda/history/<str:city_name>/', CityDetailAPI.as_view(), name='api_city_detail'),

    path('api/pogoda/forecast/<str:city_name>/', HourlyForecastAPI.as_view(), name='api_forecast'),
]