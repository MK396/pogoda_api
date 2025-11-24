
from django.urls import path


from .views import (
    LatestWeatherListAPI,
    RefreshWeatherAPI,
    CityDetailAPI,
    HourlyForecastAPI, FetchCityHistoryAPI, FetchAllHistoryAPI,
)

urlpatterns = [

    path('api/pogoda/', LatestWeatherListAPI.as_view(), name='api_weather_list'),
    path('api/pogoda/refresh/', RefreshWeatherAPI.as_view(), name='api_weather_refresh'),
    path('api/pogoda/history/<str:city_name>/', CityDetailAPI.as_view(), name='api_city_detail'),
    path('fetch-history/<str:city_name>/', FetchCityHistoryAPI.as_view(), name='fetch-history'),
    path('api/pogoda/forecast/<str:city_name>/', HourlyForecastAPI.as_view(), name='api_forecast'),
    path('fetch-history-all/', FetchAllHistoryAPI.as_view(), name='fetch-history-all'),
]