# pogoda/views.py
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from django.db.models import Max, OuterRef, Subquery
from .models import WeatherData, City, HistoricalWeatherData
from .utils import fetch_and_save_weather_data


def refresh_weather_api(request):
    """
    Pobiera aktualne dane pogodowe z Open-Meteo, zapisuje do DB,
    a następnie zwraca najnowsze odczyty dla każdego miasta.
    """
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    # 1. Pobieramy i zapisujemy nowe dane z API
    fetch_and_save_weather_data()

    # 2. Subquery: najnowszy timestamp dla każdego miasta
    latest_timestamp = WeatherData.objects.filter(
        city_id=OuterRef("city_id")
    ).order_by("-timestamp").values("timestamp")[:1]

    latest_weather_data = WeatherData.objects.filter(
        timestamp=Subquery(latest_timestamp)
    ).select_related("city").order_by("city__name")

    # 3. JSON
    return JsonResponse([
        {
            "city_name": w.city.name,
            "latitude": w.city.latitude,
            "longitude": w.city.longitude,
            "temperature": w.temperature,
            "last_updated": w.timestamp.isoformat(),
        }
        for w in latest_weather_data
    ], safe=False)


def latest_weather_list_api(request):
    """
    Zwraca najnowsze dane pogodowe — BEZ odświeżania z zewnętrznego API.
    """
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    latest_timestamp = WeatherData.objects.filter(
        city_id=OuterRef('city_id')
    ).order_by('-timestamp').values('timestamp')[:1]

    latest_weather_data = WeatherData.objects.filter(
        timestamp=Subquery(latest_timestamp)
    ).select_related('city').order_by('city__name')

    return JsonResponse([
        {
            'city_name': w.city.name,
            'latitude': w.city.latitude,
            'longitude': w.city.longitude,
            'temperature': w.temperature,
            'last_updated': w.timestamp.isoformat(),
        }
        for w in latest_weather_data
    ], safe=False)


def city_detail_api(request, city_name):
    """
    Dane historyczne konkretnego miasta — JSON.
    """
    if request.method != 'GET':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        city = City.objects.get(name__iexact=city_name)
    except City.DoesNotExist:
        return JsonResponse({'error': 'City not found'}, status=404)

    history = city.weather_readings.all().order_by('-timestamp')

    return JsonResponse({
        "city_name": city.name,
        "latitude": city.latitude,
        "longitude": city.longitude,
        "history": [
            {
                "temperature": h.temperature,
                "timestamp": h.timestamp.isoformat()
            }
            for h in history
        ]
    })
