# pogoda/views.py

from django.shortcuts import render, get_object_or_404
from .models import WeatherData, City


# Max już nam niepotrzebny, gdy upraszczamy zapytanie

def pogoda_list(request):
    """
    Tymczasowe uproszczenie: Pobierz WSZYSTKIE odczyty, aby sprawdzić,
    czy w ogóle coś się wyświetli.
    """

    # Pobieramy WSZYSTKIE dane, łącząc je z danymi o miastach
    latest_weather_data = WeatherData.objects.all().select_related('city').order_by('-timestamp')

    context = {
        'weather_data': latest_weather_data,
        # Dodaj licznik, aby sprawdzić w szablonie, ile rekordów widzi Django
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