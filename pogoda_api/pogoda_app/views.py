# pogoda/views.py (Używając DRF)
from rest_framework import views, generics, status
from rest_framework.response import Response
from django.db.models import OuterRef, Subquery
from django.shortcuts import get_object_or_404

# Używamy standardowego logowania zamiast polegania na print z utils.py
import logging

from .models import WeatherData, City
from .serializers import CurrentWeatherSerializer, CityHistorySerializer
from .utils import fetch_and_save_weather_data, fetch_hourly_forecast, generate_weather_recommendation

logger = logging.getLogger(__name__)

# ----------------------------------------------------------------------
# LOGIKA POBIERANIA NAJNOWSZYCH DANYCH (DRY)
# ----------------------------------------------------------------------

def get_latest_weather_queryset():
    """
    Zwraca queryset zawierający tylko najnowszy odczyt WeatherData dla każdego miasta.
    """
    # Subquery: najnowszy timestamp dla każdego miasta
    latest_timestamp = WeatherData.objects.filter(
        city=OuterRef("city")
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
        try:
            # Logika operacji jest teraz zawarta w utils.py i używa loggera
            fetch_and_save_weather_data()
        except Exception as e:
            logger.error("Błąd krytyczny podczas pobierania danych z zewnętrznego API: %s", e)
            return Response(
                {"error": "Wystąpił błąd serwera podczas odświeżania danych pogodowych."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
    Wyszukuje miasto bez uwzględniania wielkości liter (iexact).
    """
    serializer_class = CityHistorySerializer
    queryset = City.objects.all()

    # Ustawiamy klucze do wyszukiwania
    lookup_field = 'name'
    lookup_url_kwarg = 'city_name'

    def get_object(self):
        city_name = self.kwargs.get(self.lookup_url_kwarg)

        # Używamy get_object_or_404 do wyszukiwania i obsługi braku miasta
        obj = get_object_or_404(
            self.get_queryset(),
            name__iexact=city_name
        )
        return obj

# ----------------------------------------------------------------------
# Widok 4: /api/pogoda/forecast/<city_name>/ (Prognoza godzinowa)
# ----------------------------------------------------------------------

class HourlyForecastAPI(views.APIView):
    """
    Zwraca prognozę godzinową dla danego miasta (domyślnie 48 godzin).
    Oraz REKOMENDACJĘ (AI/Algorytm).
    """

    def get(self, request, city_name):
        city = get_object_or_404(City, name__iexact=city_name)

        hours_param = request.query_params.get("hours", 48)
        try:
            hours = int(hours_param)
            if hours <= 0:
                raise ValueError
        except ValueError:
            return Response(
                {"error": f"Niepoprawny parametr 'hours': {hours_param}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # 1. Pobieramy prognozę (lista słowników)
            forecast = fetch_hourly_forecast(city, hours=hours)

            # 2. Generujemy rekomendację na podstawie tej prognozy
            recommendation_text = generate_weather_recommendation(forecast)

            # 3. Zwracamy wszystko w JSON (Wewnątrz try, aby zmienna była widoczna)
            return Response(
                {
                    "city": city.name,
                    "hours": hours,
                    "hourly": forecast,
                    "recommendation": recommendation_text
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {"error": f"Błąd pobierania prognozy: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



    class HourlyForecastAPI(views.APIView):
        """
        Zwraca prognozę godzinową dla danego miasta (domyślnie 48 godzin).
        Oraz REKOMENDACJĘ (AI/Algorytm).
        """

        def get(self, request, city_name):
            city = get_object_or_404(City, name__iexact=city_name)

            hours_param = request.query_params.get("hours", 48)
            try:
                hours = int(hours_param)
                if hours <= 0:
                    raise ValueError
            except ValueError:
                return Response(
                    {"error": f"Niepoprawny parametr 'hours'."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                # 1. Pobieramy prognozę (lista słowników)
                forecast = fetch_hourly_forecast(city, hours=hours)

                # 2. Generujemy rekomendację na podstawie tej prognozy
                recommendation_text = generate_weather_recommendation(forecast)

            except Exception as e:
                return Response(
                    {"error": f"Błąd pobierania prognozy: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # 3. Zwracamy wszystko w JSON
            return Response(
                {
                    "city": city.name,
                    "hours": hours,
                    "hourly": forecast,
                    "recommendation": recommendation_text  # <--- PRZYWRÓCONE POLE
                },
                status=status.HTTP_200_OK
            )