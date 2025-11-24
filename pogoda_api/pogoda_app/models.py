# pogoda/models.py
from django.db import models


class City(models.Model):
    """Przechowuje statyczne dane geograficzne miast."""
    name = models.CharField(max_length=100, unique=True, primary_key=True)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Cities"


class WeatherData(models.Model):
    """
    Przechowuje odczyty pogody:
    - Bieżące (pobierane co godzinę z /refresh/)
    - Historyczne (pobierane raz dziennie z /fetch-history/)
    """
    city = models.ForeignKey(
        City,
        on_delete=models.CASCADE,
        related_name='weather_readings'
    )

    temperature = models.FloatField()
    precipitation = models.FloatField(null=True, blank=True)
    wind_speed = models.FloatField(null=True, blank=True)
    relative_humidity = models.FloatField(null=True, blank=True)

    timestamp = models.DateTimeField()

    def __str__(self):
        return (
            f"{self.city.name}: {self.temperature}°C, "
            f"({self.timestamp.strftime('%Y-%m-%d %H:%M')})"
        )

    class Meta:
        ordering = ['-timestamp']
        db_table = 'pogoda_data'