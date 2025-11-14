import openmeteo_requests
import pandas as pd
import requests_cache
from retry_requests import retry
import mysql.connector
from datetime import datetime
import pytz  # pip install pytz

# --- 1. Setup Open-Meteo client ---
cache_session = requests_cache.CachedSession('.cache', expire_after=3600)
retry_session = retry(cache_session, retries=5, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)

# --- 2. Lista miast wojewódzkich ---
cities = {
    "Warszawa": (52.2297, 21.0122),
    "Kraków": (50.0647, 19.9450),
    "Łódź": (51.7592, 19.4550),
    "Wrocław": (51.1079, 17.0385),
    "Poznań": (52.4064, 16.9252),
    "Gdańsk": (54.3520, 18.6466),
    "Szczecin": (53.4285, 14.5528),
    "Bydgoszcz": (53.1235, 18.0084),
    "Lublin": (51.2465, 22.5684),
    "Białystok": (53.1325, 23.1688),
    "Katowice": (50.2649, 19.0238),
    "Gorzów Wlkp.": (52.7368, 15.2288),
    "Zielona Góra": (51.9356, 15.5062),
    "Opole": (50.6751, 17.9213),
    "Kielce": (50.8661, 20.6286),
    "Rzeszów": (50.0413, 21.9990)
}

results = []

# --- 3. Pobieranie danych pogodowych ---
for city, (lat, lon) in cities.items():
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m"
    }

    responses = openmeteo.weather_api(url, params=params)
    response = responses[0]

    current = response.Current()
    temp = current.Variables(0).Value()  # temperatura w °C

    czas_pl = datetime.now(pytz.timezone("Europe/Warsaw"))

    results.append({
        "Miasto": city,
        "Szerokosc": lat,
        "Dlugosc": lon,
        "Temperatura": temp,
        "Czas": czas_pl
    })

# --- 4. Tworzymy DataFrame ---
df = pd.DataFrame(results)
print(df)

# --- 5. Zapis do MySQL ---
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="pogoda_aktualna"
)
cursor = conn.cursor()

# --- 6. Wstawianie danych z REPLACE ---
for row in results:
    cursor.execute("""
        REPLACE INTO pogoda (miasto, szerokosc_geo, dlugosc_geo, temperatura, czas)
        VALUES (%s, %s, %s, %s, %s)
    """, (row["Miasto"], row["Szerokosc"], row["Dlugosc"], row["Temperatura"], row["Czas"]))

conn.commit()
cursor.close()
conn.close()
