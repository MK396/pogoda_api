# pogoda/views.py (Używając DRF)
from rest_framework import views, generics, status
from rest_framework.response import Response
from django.db.models import OuterRef, Subquery
from django.shortcuts import get_object_or_404  # Użyjemy tego, zamiast generics.get_object_or_404

from .models import WeatherData, City
from .serializers import CurrentWeatherSerializer, CityHistorySerializer
from .utils import fetch_and_save_weather_data, fetch_hourly_forecast


# from .utils import fetch_and_save_weather_data # Zakładamy, że to działa

# ----------------------------------------------------------------------
# LOGIKA POBIERANIA NAJNOWSZYCH DANYCH
# ----------------------------------------------------------------------

def get_latest_weather_queryset():
    """
    Wspólna logika do pobrania NAJNOWSZYCH odczytów dla każdego miasta.
    """
    # Subquery: najnowszy timestamp dla każdego miasta
    latest_timestamp = WeatherData.objects.filter(
        city=OuterRef("city")  # Zmieniono na "city" zamiast "city_id" dla czystości
    ).order_by("-timestamp").values("timestamp")[:1]

    # Zwracamy rekordy, których timestamp równa się najnowszemu
    return WeatherData.objects.filter(
        timestamp=Subquery(latest_timestamp)
    ).select_related("city").order_by("city__name")


# ----------------------------------------------------------------------
# Widok 1: /api/pogoda/ (Lista aktualnej pogody)
# ----------------------------------------------------------------------

class LatestWeatherListAPI(generics.ListAPIView):
    """
    Zwraca najnowsze dane pogodowe BEZ odświeżania z zewnętrznego API.
    """
    serializer_class = CurrentWeatherSerializer

    def get_queryset(self):
        return get_latest_weather_queryset()


# ----------------------------------------------------------------------
# Widok 2: /api/pogoda/refresh/ (Odświeżanie)
# ----------------------------------------------------------------------

class RefreshWeatherAPI(views.APIView):
    """
    Pobiera, zapisuje i zwraca najnowsze odczyty dla każdego miasta.
    """

    def get(self, request):
        # 1. Pobieramy i zapisujemy nowe dane z API
        # Pamiętaj, aby zaimportować i upewnić się, że to działa
        # fetch_and_save_weather_data()
        try:
            fetch_and_save_weather_data()
        except ValueError as e:
            print(f"Błąd podczas pobierania danych z zewnętrznego API: {e}")
        # 2. Pobieramy zaktualizowany queryset
        latest_weather_data = get_latest_weather_queryset()

        # 3. Serializujemy i zwracamy
        serializer = CurrentWeatherSerializer(latest_weather_data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ----------------------------------------------------------------------
# Widok 3: /api/pogoda/history/<city_name>/ (Historia)
# ----------------------------------------------------------------------

class CityDetailAPI(generics.RetrieveAPIView):
    """
    Zwraca dane historyczne konkretnego miasta (JSON).
    Używa lookup_field='name' i customowego get_object do wyszukiwania iexact.
    """
    serializer_class = CityHistorySerializer
    queryset = City.objects.all()

    # 1. Ustawiamy lookup_field na pole modelu, którego używamy do wyszukiwania
    lookup_field = 'name'
    # 2. Ustawiamy klucz URL, którego użyliśmy w urls.py
    lookup_url_kwarg = 'city_name'

    def get_object(self):
        # Pobieramy wartość z URL
        city_name = self.kwargs.get(self.lookup_url_kwarg)

        # Wyszukujemy obiekt City za pomocą name__iexact (bez uwzględniania wielkości liter)
        # i automatycznie obsługujemy błąd 404, jeśli nie znajdzie miasta.
        obj = get_object_or_404(
            self.get_queryset(),
            name__iexact=city_name
        )

        # Opcjonalnie: optymalizacja historii
        # Prefetching danych historycznych dla tego konkretnego miasta
        # obj = obj.prefetch_related('weather_readings')

        return obj

# ----------------------------------------------------------------------
# Widok 4: /api/pogoda/forecast/<city_name>/ (Prognoza godzinowa)
# ----------------------------------------------------------------------

class HourlyForecastAPI(views.APIView):
    """
    Zwraca prognozę godzinową dla danego miasta (domyślnie 48 godzin).
    Parametr GET 'hours' może ograniczyć liczbę godzin prognozy.
    """

    def get(self, request, city_name):
        # 1. Pobranie obiektu miasta lub 404
        city = get_object_or_404(City, name__iexact=city_name)

        # 2. Odczyt parametru 'hours' z zapytania GET, domyślnie 48
        hours_param = request.query_params.get("hours", 48)
        try:
            hours = int(hours_param)
            if hours <= 0:
                raise ValueError
        except ValueError:
            return Response(
                {"error": f"Niepoprawny parametr 'hours': {hours_param}. Podaj liczbę całkowitą większą niż 0."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Pobranie prognozy
        try:
            forecast = fetch_hourly_forecast(city, hours=hours)
        except Exception as e:
            return Response(
                {"error": f"Błąd pobierania prognozy: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # 4. Zwrócenie danych
        return Response(
            {
                "city": city.name,
                "hours": hours,
                "hourly": forecast
            },
            status=status.HTTP_200_OK
        )
