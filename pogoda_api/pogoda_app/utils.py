# pogoda/utils.py

import openmeteo_requests
from retry_requests import retry
import requests_cache
import pytz
from datetime import datetime
from django.db import IntegrityError
from .models import City, WeatherData  # Importujemy oba nowe modele


def fetch_and_save_weather_data():
    """
    Pobiera dane pogodowe dla wszystkich miast z tabeli City i zapisuje je
    jako nowe odczyty w tabeli WeatherData.
    """

    # 1. Setup Open-Meteo client
    # Używamy sesji z cachem, aby nie przeciążać API (dane odświeżają się co godzinę)
    cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
    retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
    openmeteo = openmeteo_requests.Client(session=retry_session)

    # 2. Pobieramy wszystkie miasta z bazy danych
    cities_to_fetch = City.objects.all()

    # Adres API
    url = "https://api.open-meteo.com/v1/forecast"

    # Strefa czasowa dla tagowania czasu zapisu
    czas_pl = datetime.now(pytz.timezone("Europe/Warsaw"))

    print(f"--- Rozpoczęcie pobierania danych o pogodzie: {czas_pl.strftime('%H:%M:%S')} ---")

    for city_obj in cities_to_fetch:
        # 3. Używamy współrzędnych z obiektu City
        params = {
            "latitude": city_obj.latitude,
            "longitude": city_obj.longitude,
            "current": "temperature_2m",
            # Dodaj inne parametry, jeśli są potrzebne (np. wilgotność, wiatr)
        }

        try:
            # Wywołanie API
            responses = openmeteo.weather_api(url, params=params)
            response = responses[0]
            current = response.Current()
            temp = current.Variables(0).Value()

            # 4. Zapis nowego odczytu do bazy Django (model WeatherData)
            # Tworzymy nowy rekord dla każdego odczytu
            WeatherData.objects.create(
                city=city_obj,
                temperature=temp,
                timestamp=czas_pl
            )

            print(f"  ✅ Zapisano: {city_obj.name} ({temp}°C)")

        except IntegrityError:
            print(f"  ❌ Błąd integralności danych dla {city_obj.name}.")
        except Exception as e:
            print(f"  ❌ Błąd podczas pobierania danych dla {city_obj.name}: {e}")

    print("--- Zakończono pobieranie danych. ---")

# Aby uruchomić tę funkcję, użyj Django Shell:
# python manage.py shell
# >>> from pogoda.utils import fetch_and_save_weather_data
# >>> fetch_and_save_weather_data()