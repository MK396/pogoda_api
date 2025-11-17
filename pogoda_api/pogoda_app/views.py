# pogoda/views.py
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404
from .models import WeatherData, City, HistoricalWeatherData
from django.db.models import Max, OuterRef, Subquery
from django.shortcuts import redirect
from .utils import fetch_and_save_weather_data

def fetch_weather_view(request):
    """
    Wywołuje pobranie danych pogodowych i wraca na stronę listy.
    """
    fetch_and_save_weather_data()
    return redirect('pogoda_list')  # przekierowanie na listę miast

# Max już nam niepotrzebny, gdy upraszczamy zapytanie

def pogoda_list(request):
    # Pobieramy ID najnowszego odczytu dla każdego miasta
    latest_ids = WeatherData.objects.values('city').annotate(latest_id=Max('id')).values_list('latest_id', flat=True)

    # Pobieramy te rekordy
    latest_weather_data = WeatherData.objects.filter(id__in=latest_ids).select_related('city').order_by('-temperature')

    context = {
        'weather_data': latest_weather_data,
        'count': latest_weather_data.count()
    }

    return render(request, 'pogoda_list.html', context)


def city_detail(request, city_name):
    """
    Wyświetla wszystkie historyczne odczyty temperatury dla określonego miasta.
    """

    # 1. Znajdujemy miasto po nazwie. Jeśli nie istnieje, zwraca błąd 404.
    city = get_object_or_404(City, name=city_name)

    # 2. Pobieramy WSZYSTKIE odczyty pogody dla tego miasta, sortując je od najnowszych
    # Używamy related_name='weather_readings' z modelu City.
    historical_readings = city.weather_readings.all().order_by('-timestamp')

    context = {
        'city': city,
        'history': historical_readings,
    }

    return render(request, 'city_detail.html', context)

def historical_weather_list(request):
    cities = City.objects.all()  # lista miast
    selected_city = request.GET.get("city")  # pobieramy miasto z query param, np. ?city=Warsaw

    if selected_city:
        data = HistoricalWeatherData.objects.filter(city__name=selected_city).order_by('-date')
    else:
        data = HistoricalWeatherData.objects.all().order_by('-date')

    context = {
        "cities": cities,
        "data": data,
        "selected_city": selected_city
    }
    return render(request, "historical_weather.html", context)


def latest_weather_list_api(request):
    """
    Zwraca najnowsze dane pogodowe dla każdego miasta w formacie JSON.
    Używa Subquery, aby ominąć ograniczenia DISTINCT ON na SQLite/MySQL.
    """
    if request.method == 'GET':

        # 1. Tworzymy subzapytanie, które znajdzie maksymalny (najnowszy) timestamp
        # dla każdego rekordu w tabeli WeatherData.
        # OuterRef odnosi się do pola z zewnętrznego zapytania (weatherdata)
        latest_timestamp = WeatherData.objects.filter(
            city_id=OuterRef('city_id')
        ).order_by('-timestamp').values('timestamp')[:1]
        # Zwraca tylko pole 'timestamp' i tylko pierwszy wynik (najnowszy)

        # 2. Głównym zapytaniem filtrujemy wszystkie rekordy,
        # gdzie ich timestamp jest RÓWNY najnowszemu timestampowi znalezionemu
        # przez subzapytanie (dla tego samego miasta).
        latest_weather_data = WeatherData.objects.filter(
            timestamp=Subquery(latest_timestamp)
        ).select_related('city').order_by('city__name')

        # Serializacja danych do formatu JSON
        data = []
        for item in latest_weather_data:
            data.append({
                'city_name': item.city.name,
                'latitude': item.city.latitude,
                'longitude': item.city.longitude,
                'temperature': item.temperature,
                'last_updated': item.timestamp.isoformat(),
            })

        return JsonResponse(data, safe=False)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


def city_detail_api(request, city_name):
    """
    Zwraca historyczne odczyty dla określonego miasta w formacie JSON.
    URL: GET /api/pogoda/history/NazwaMiasta/
    """
    if request.method == 'GET':
        try:
            # 1. Znajdujemy miasto (może użyć get_object_or_404, ale dla API lepiej ręcznie)
            city = City.objects.get(name__iexact=city_name)  # __iexact ignoruje wielkość liter
        except City.DoesNotExist:
            return JsonResponse({'error': f'City "{city_name}" not found'}, status=404)

        # 2. Pobieramy historyczne odczyty
        historical_readings = city.weather_readings.all().order_by('-timestamp')

        # 3. Serializacja danych
        data = {
            'city_name': city.name,
            'latitude': city.latitude,
            'longitude': city.longitude,
            'history': [
                {
                    'temperature': reading.temperature,
                    'timestamp': reading.timestamp.isoformat()
                }
                for reading in historical_readings
            ]
        }

        return JsonResponse(data)

    return JsonResponse({'error': 'Method not allowed'}, status=405)

