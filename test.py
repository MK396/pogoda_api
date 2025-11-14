import mysql.connector
import pandas as pd

# --- 1. Połączenie do bazy ---
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="pogoda_aktualna"
)

cursor = conn.cursor()

# --- 2. Pobranie danych ---
cursor.execute("SELECT miasto, temperatura, dlugosc_geo, szerokosc_geo FROM pogoda")

# --- 3. Odczyt wyników ---
rows = cursor.fetchall()

# --- 4. Zamknięcie połączenia ---
cursor.close()
conn.close()

# --- 5. Opcjonalnie: utworzenie DataFrame i wypisanie ---
df = pd.DataFrame(rows, columns=["Miasto", "Temperatura [°C]", "Długość geo", "Szerokość geo"])
print(df)
