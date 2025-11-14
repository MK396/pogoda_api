import mysql.connector

connection = None

try:
    connection = mysql.connector.connect(
        host='localhost',
        database='pogoda_aktualna',
        user='root',
        password='root'
    )

    if connection.is_connected():
        print("Połączono z bazą danych MySQL")
    else:
        print("Nie udało się połączyć z bazą danych MySQL")

except mysql.connector.Error as err:
    print(f"Błąd połączenia: {err}")

finally:
    if connection and connection.is_connected():
        connection.close()
        print("Połączenie z bazą danych MySQL zostało zamknięte")