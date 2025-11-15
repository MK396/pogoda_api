# pogoda/views.py

from django.shortcuts import render, get_object_or_404
from .models import WeatherData, City, HistoricalWeatherData
from django.db.models import Max
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

