
import logging
from datetime import datetime, timedelta, time

import openmeteo_requests
import pytz
import requests
import requests_cache
from django.db import IntegrityError
from retry_requests import retry

from .models import City, WeatherData

logger = logging.getLogger(__name__)


def setup_openmeteo_client():
    """Konfiguruje klienta Open-Meteo z mechanizmem cache i retry."""
    cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
    return openmeteo_requests.Client(session=retry(cache_session, retries=5, backoff_factor=0.2))


def fetch_and_save_weather_data():
    """
    Pobiera dane pogodowe dla wszystkich miast z tabeli City i zapisuje je
    jako nowe odczyty w tabeli WeatherData.

    ZMIANA: Sprawdza, czy dane w bazie są świeże (< 5 minut).
    Jeśli tak, pomija pobieranie z zewnętrznego API.
    """

    # --- 1. SPRAWDZENIE ŚWIEŻOŚCI DANYCH (CACHE LOGIC) ---
    last_reading = WeatherData.objects.order_by('-timestamp').first()

    if last_reading:
        # Pobieramy aktualny czas w tej samej strefie co dane w bazie
        tz = pytz.timezone("Europe/Warsaw")
        now = datetime.now(tz)

        # Obliczamy różnicę czasu
        time_difference = now - last_reading.timestamp

        # 300 sekund = 5 minut
        if time_difference.total_seconds() < 300:
            logger.info(f"⏳ Dane są świeże (sprzed {int(time_difference.total_seconds())}s). Pomijam zewnętrzne API.")
            return  # <--- PRZERYWAMY FUNKCJĘ TUTAJ, nie wykonujemy requestu do OpenMeteo
        else:
            logger.info(f"🔄 Dane są przestarzałe (sprzed {int(time_difference.total_seconds())}s). Pobieram nowe...")
    else:
        logger.info("🆕 Pusta baza danych. Pobieram pierwsze dane...")

    # --- 2. SETUP KLIENTA I POBIERANIE (BEZ ZMIAN) ---
    cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
    retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
    openmeteo = openmeteo_requests.Client(session=retry_session)

    cities_to_fetch = City.objects.all()
    url = "https://api.open-meteo.com/v1/forecast"
    czas_pl = datetime.now(pytz.timezone("Europe/Warsaw"))

    logger.info(f"--- Start pobierania bieżącej pogody: {czas_pl.strftime('%H:%M:%S')} ---")

    for city_obj in cities_to_fetch:
        params = {
            "latitude": city_obj.latitude,
            "longitude": city_obj.longitude,
            "current": "temperature_2m,precipitation,windspeed_10m,relative_humidity_2m",
        }

        try:
            responses = openmeteo.weather_api(url, params=params)
            response = responses[0]
            current = response.Current()
            temp = current.Variables(0).Value()
            precipitation = current.Variables(1).Value()
            wind_speed = current.Variables(2).Value()
            relative_humidity = current.Variables(3).Value()

            WeatherData.objects.create(
                city=city_obj,
                temperature=temp,
                precipitation=precipitation,
                wind_speed=wind_speed,
                relative_humidity=relative_humidity,
                timestamp=czas_pl
            )
            logger.info(f"  ✅ {city_obj.name} | {temp:.1f}°C")

        except Exception as e:
            logger.error(f"  ❌ Błąd dla {city_obj.name}: {e}")

    logger.info("--- Koniec pobierania. ---")

def fetch_hourly_forecast(city, hours=48):
    """
    Pobiera prognozę godzinową dla danego miasta od aktualnej godziny.
    Zwraca listę słowników z danymi godzinowymi.
    """


    start_time = datetime.now(pytz.timezone("Europe/Warsaw")).replace(minute=0, second=0, microsecond=0)
    end_time = start_time + timedelta(hours=hours)

    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": city.latitude,
        "longitude": city.longitude,
        "hourly": "temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m",
        "timezone": "Europe/Warsaw",
        "start_date": start_time.strftime("%Y-%m-%d"),  # Zmieniono 'start' na 'start_date' w zapytaniu API Open-Meteo
        "end_date": end_time.strftime("%Y-%m-%d"),  # Zmieniono 'end' na 'end_date'
        "time_start": start_time.strftime("%Y-%m-%dT%H:00"),  # Dodano precyzyjne limity godzinowe
        "time_end": end_time.strftime("%Y-%m-%dT%H:00"),
    }

    try:
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()

        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        temperatures = hourly.get("temperature_2m", [])
        precipitation = hourly.get("precipitation", [])
        wind_speed = hourly.get("wind_speed_10m", [])
        relative_humidity = hourly.get("relative_humidity_2m", [])

        forecast_data = []
        for i in range(len(times)):
            if i >= hours:
                break

            forecast_data.append({
                "time": times[i],
                "temperature": temperatures[i],
                "precipitation": precipitation[i],
                "wind_speed": wind_speed[i],
                "relative_humidity": relative_humidity[i]
            })

        return forecast_data

    except requests.exceptions.RequestException as e:
        logger.error("❌ Błąd żądania API dla prognozy dla %s: %s", city.name, e)

        raise Exception(f"Błąd API: {e}")
    except Exception as e:
        logger.error("❌ Nieoczekiwany błąd pobierania prognozy dla %s: %s", city.name, e)
        raise e

def calculate_perceived_temp(temp, humidity, wind_speed):
    """
    Kalkuluje odczuwalną temperaturę (Perceived Temperature)
    używając uproszczonych reguł:
    1. Jeśli temp jest poniżej 10C, używa prostego Wind Chill (wiatr obniża temp.)
    2. Jeśli temp jest powyżej 25C, używa prostego Heat Index (wilgotność podnosi temp.)
    3. W przeciwnym razie zwraca temperaturę powietrza.
    """
    if temp is None:
        return None

    # Uproszczona korekta na zimno (Wind Chill):
    if temp < 10 and  wind_speed > 3:
        # Uproszczona formuła: obniżenie temp. jest proporcjonalne do prędkości wiatru
        wind_factor = (wind_speed - 3) * 0.2
        return temp - wind_factor

    # Uproszczona korekta na gorąco (Heat Index): wilgotność podnosi temperaturę powyżej 25°C
    if temp > 25 and  humidity > 50:
        # Uproszczona formuła: podniesienie temp. proporcjonalne do wilgotności
        humidity_factor = (humidity - 50) / 10 * 0.5
        return temp + humidity_factor

    return temp


def generate_weather_recommendation(hourly_data):
    """
    Analizuje dane godzinowe i zwraca tekstową rekomendację (string).
    Bierzemy pod uwagę np. pierwsze 12 godzin prognozy.
    """
    if not hourly_data:
        return "Brak danych do wygenerowania rekomendacji."

    # Analizujemy np. najbliższe 12 godzin (lub mniej, jeśli danych jest mniej)
    check_range = hourly_data[:12]

    will_rain = any(h['precipitation'] > 0.0 for h in check_range)
    # Przyjmijmy, że silny wiatr to > 10 m/s (~36 km/h)
    strong_wind = any(h['wind_speed'] > 10.0 for h in check_range)

    temps = [h['temperature'] for h in check_range]
    min_temp = min(temps) if temps else 0
    max_temp = max(temps) if temps else 0

    recs = []

    if will_rain:
        recs.append("☔ Weź parasol, zapowiadane są opady.")

    if strong_wind:
        recs.append("💨 Uważaj na silny wiatr, może wpływać na rozgrywkę w plenerze!")

    if min_temp < 0:
        recs.append("❄️ Ubierz się ciepło, mróz na zewnątrz.")
    elif max_temp > 25:
        recs.append("☀️ Jest gorąco! Pamiętaj o nawodnieniu i chłodzeniu PC.")
    elif 10 <= max_temp <= 20 and not will_rain and not strong_wind:
        recs.append("🎮 Idealna pogoda na spacer... lub dłuższą sesję gamingową przy otwartym oknie.")

    if not recs:
        return "Pogoda wygląda na stabilną. Dobrego dnia!"

    return " ".join(recs)


def fetch_and_save_last_30_days(city):
    """
    Pobiera dane dzienne z ostatnich 30 dni i zapisuje je do tabeli WeatherData.
    Ponieważ WeatherData wymaga czasu, ustawiamy godzinę na 12:00 dla każdego dnia.
    """
    # Zakres dat: od wczoraj do 30 dni wstecz
    end_date = datetime.now().date() - timedelta(days=1)
    start_date = end_date - timedelta(days=29)

    url = "https://archive-api.open-meteo.com/v1/era5"

    params = {
        "latitude": city.latitude,
        "longitude": city.longitude,
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),

        "daily": "temperature_2m_mean,precipitation_sum,wind_speed_10m_max,relative_humidity_2m_mean",
        "timezone": "Europe/Warsaw"
    }

    try:
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        daily = data.get("daily", {})

        dates = daily.get("time", [])
        temps = daily.get("temperature_2m_mean", [])
        precip = daily.get("precipitation_sum", [])
        winds = daily.get("wind_speed_10m_max", [])
        humid = daily.get("relative_humidity_2m_mean", [])  # Wilgotność

        if not dates:
            logger.warning(f"Brak danych historycznych dla {city.name}")
            return False


        tz = pytz.timezone("Europe/Warsaw")

        for i, date_str in enumerate(dates):

            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()


            naive_datetime = datetime.combine(date_obj, time(0, 0))
            aware_datetime = tz.localize(naive_datetime)


            t = temps[i] if i < len(temps) and temps[i] is not None else 0.0
            p = precip[i] if i < len(precip) and precip[i] is not None else 0.0
            w = winds[i] if i < len(winds) and winds[i] is not None else 0.0
            h = humid[i] if i < len(humid) and humid[i] is not None else 50.0


            WeatherData.objects.update_or_create(
                city=city,
                timestamp=aware_datetime,
                defaults={
                    "temperature": t,
                    "precipitation": p,
                    "wind_speed": w,
                    "relative_humidity": h
                }
            )

        logger.info(f"✅ Zaktualizowano historię (WeatherData) 30 dni dla: {city.name}")
        return True

    except Exception as e:
        logger.error(f"❌ Błąd pobierania historii 30 dni dla {city.name}: {e}")
        raise e


def fetch_history_for_all_cities():
    """
    Uruchamia pobieranie historii (30 dni) dla KAŻDEGO miasta w bazie.
    Zwraca raport (listę komunikatów).
    """
    cities = City.objects.all()
    report = []

    logger.info("--- START: Pobieranie historii dla wszystkich miast ---")

    for city in cities:
        try:
            success = fetch_and_save_last_30_days(city)
            status = "OK" if success else "Brak danych"
            report.append(f"{city.name}: {status}")
        except Exception as e:
            logger.error(f"Błąd przy masowym pobieraniu dla {city.name}: {e}")
            report.append(f"{city.name}: BŁĄD ({str(e)})")

    logger.info("--- KONIEC: Pobieranie historii zakończone ---")
    return report