from django.db import models


class City(models.Model):
    """Przechowuje statyczne dane geograficzne miast."""

    # Nazwa Miasta (Klucz Główny dla logiki aplikacji)
    name = models.CharField(
        max_length=100,
        unique=True,
        primary_key=True  # Ustawiamy miasto jako klucz główny dla łatwego wyszukiwania
    )
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name

    class Meta:
        # Możesz zachować starą nazwę tabeli, jeśli była już zdefiniowana
        # db_table = 'city'
        verbose_name_plural = "Cities"


# --- MODEL WEATHER DATA (Przechowuje odczyty z API) ---
class WeatherData(models.Model):
    """Przechowuje historyczne i aktualne odczyty pogody."""

    # RELACJA JEDEN DO WIELU (ForeignKey)
    # Każdy odczyt pogodowy (WeatherData) jest powiązany z jednym miastem (City).
    # 'on_delete=models.CASCADE' oznacza, że usunięcie miasta usunie wszystkie jego odczyty.
    city = models.ForeignKey(
        City,
        on_delete=models.CASCADE,
        related_name='weather_readings'  # Pozwala na City.weather_readings.all()
    )

    temperature = models.FloatField()

    # Używamy DateTimeField zamiast FloatField na czas
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        # Wyświetl nazwę miasta, temperaturę i czas dla czytelności
        return f"{self.city.name}: {self.temperature}°C ({self.timestamp.strftime('%Y-%m-%d %H:%M')})"

    class Meta:
        # Sortowanie po czasie, aby najnowsze dane były na górze
        ordering = ['-timestamp']
        db_table = 'pogoda_data'  # Nowa nazwa dla tabeli danych, aby była jasna
