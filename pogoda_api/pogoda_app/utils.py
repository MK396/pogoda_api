# pogoda/utils.py

import openmeteo_requests
from retry_requests import retry
import requests_cache
import pytz
from datetime import datetime
from django.db import IntegrityError
from .models import City, WeatherData, HistoricalWeatherData  # Importujemy oba nowe modele
from datetime import datetime, timedelta
from calendar import monthrange
import requests

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
            "current": "temperature_2m,precipitation,windspeed_10m",
            # Dodaj inne parametry, jeśli są potrzebne (np. wilgotność, wiatr)
        }

        try:
            # Wywołanie API
            responses = openmeteo.weather_api(url, params=params)
            response = responses[0]
            current = response.Current()
            temp = current.Variables(0).Value()
            precipitation = current.Variables(1).Value()
            wind_speed = current.Variables(2).Value()

            # 4. Zapis nowego odczytu do bazy Django (model WeatherData)
            # Tworzymy nowy rekord dla każdego odczytu
            WeatherData.objects.create(
                city=city_obj,
                temperature=temp,
                precipitation=precipitation,
                wind_speed=wind_speed,
                timestamp=czas_pl
            )

            print(f"  ✅ {city_obj.name} | {temp}°C | opady: {precipitation} mm | wiatr: {wind_speed} m/s")

        except IntegrityError:
            print(f"  ❌ Błąd integralności danych dla {city_obj.name}.")
        except Exception as e:
            print(f"  ❌ Błąd podczas pobierania danych dla {city_obj.name}: {e}")

    print("--- Zakończono pobieranie danych. ---")

# Aby uruchomić tę funkcję, użyj Django Shell:
# python manage.py shell
# >>> from pogoda.utils import fetch_and_save_weather_data
# >>> fetch_and_save_weather_data()

def fetch_and_save_historical_weather_monthly_requests(city, start_date, end_date):
    """
    Pobiera dane historyczne z Open-Meteo przy użyciu requests (JSON),
    agreguje je miesięcznie i zapisuje do HistoricalWeatherData.
    """
    today = datetime.now().date()
    if end_date > today:
        end_date = today

    current_date = start_date

    while current_date <= end_date:
        last_day = monthrange(current_date.year, current_date.month)[1]
        month_end = min(datetime(current_date.year, current_date.month, last_day).date(), end_date)

        url = "https://archive-api.open-meteo.com/v1/era5"
        params = {
            "latitude": city.latitude,
            "longitude": city.longitude,
            "start_date": current_date.strftime("%Y-%m-%d"),
            "end_date": month_end.strftime("%Y-%m-%d"),
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max",
            "timezone": "Europe/Warsaw",
            "format": "json"
        }

        try:
            r = requests.get(url, params=params, timeout=30)
            r.raise_for_status()
            data = r.json()
            daily = data.get("daily", {})

            dates = daily.get("time", [])
            temps_max = daily.get("temperature_2m_max", [])
            temps_min = daily.get("temperature_2m_min", [])
            precip = daily.get("precipitation_sum", [])
            wind = daily.get("windspeed_10m_max", [])

            if not dates:
                print(f"❌ Brak danych dla {city.name} od {current_date} do {month_end}")
            else:
                temps = [(temps_max[i] + temps_min[i]) / 2 for i in range(len(dates))]
                avg_temp = sum(temps) / len(temps)
                avg_precipitation = sum(precip) / len(dates)
                avg_wind = sum(wind) / len(dates)

                try:
                    HistoricalWeatherData.objects.create(
                        city=city,
                        temperature=avg_temp,
                        date=datetime(current_date.year, current_date.month, 1).date(),
                        precipitation=avg_precipitation,
                        wind_speed=avg_wind
                    )
                    print(f"✅ Zapisano {city.name} - {current_date.year}-{current_date.month}: {avg_temp:.2f}°C")
                except IntegrityError:
                    print(f"❌ Rekord już istnieje: {city.name} - {current_date.year}-{current_date.month}")

        except Exception as e:
            print(f"❌ Błąd dla {city.name} od {current_date} do {month_end}: {e}")

        # Przechodzimy do następnego miesiąca
        if current_date.month == 12:
            current_date = datetime(current_date.year + 1, 1, 1).date()
        else:
            current_date = datetime(current_date.year, current_date.month + 1, 1).date()


def fetch_hourly_forecast(city, hours=48):
    """
    Pobiera prognozę godzinową dla danego miasta.

    Parametry:
        city: obiekt City
        hours: ile godzin prognozy pobrać (domyślnie 48h)

    Zwraca słownik z danymi hourly: time, temperature, precipitation, wind_speed
    """
    from datetime import datetime, timedelta
    import requests

    # Open-Meteo API
    url = "https://api.open-meteo.com/v1/forecast"

    # Parametry API
    params = {
        "latitude": city.latitude,
        "longitude": city.longitude,
        "hourly": "temperature_2m,precipitation,wind_speed_10m",
        "timezone": "Europe/Warsaw",
    }

    try:
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()

        # Dane godzinowe
        hourly = data.get("hourly", {})
        times = hourly.get("time", [])[:hours]
        temperatures = hourly.get("temperature_2m", [])[:hours]
        precipitation = hourly.get("precipitation", [])[:hours]
        wind_speed = hourly.get("wind_speed_10m", [])[:hours]

        forecast_data = []
        for i in range(len(times)):
            forecast_data.append({
                "time": times[i],
                "temperature": temperatures[i],
                "precipitation": precipitation[i],
                "wind_speed": wind_speed[i],
            })

        return forecast_data

    except Exception as e:
        print(f"❌ Błąd pobierania prognozy dla {city.name}: {e}")
        return []
