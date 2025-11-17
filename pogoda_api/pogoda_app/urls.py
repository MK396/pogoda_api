# pogoda/urls.py
from django.urls import path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    path('', TemplateView.as_view(template_name='index.html'), name='home'),

    # API — bez odświeżania
    path('api/pogoda/', views.latest_weather_list_api, name='api_weather_list'),

    # API — z odświeżaniem
    path('api/pogoda/refresh/', views.refresh_weather_api, name='api_weather_refresh'),

    # API — dane miasta
    path('api/pogoda/history/<str:city_name>/', views.city_detail_api, name='api_city_detail'),
]
