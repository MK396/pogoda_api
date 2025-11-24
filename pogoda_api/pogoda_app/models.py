from django.db import models


class City(models.Model):
    """Przechowuje statyczne dane geograficzne miast."""

    name = models.CharField(
        max_length=100,
        unique=True,
        primary_key=True
    )
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Cities"


class WeatherData(models.Model):
    """Przechowuje aktualne i bieżące odczyty pogody z API."""

    city = models.ForeignKey(
        City,
        on_delete=models.CASCADE,
        related_name='weather_readings'
    )

    # Dane z API
    temperature = models.FloatField()
    precipitation = models.FloatField(null=True, blank=True)
    wind_speed = models.FloatField(null=True, blank=True)
    relative_humidity = models.FloatField(null=True, blank=True)
    timestamp = models.DateTimeField()

    def __str__(self):
        return (
            f"{self.city.name}: {self.temperature}°C, "
            f"opady={self.precipitation} mm, wiatr={self.wind_speed} m/s, "
            f"wilgotność={self.relative_humidity}% "  # Aktualizacja __str__
            f"({self.timestamp.strftime('%Y-%m-%d %H:%M')})"
        )
    # ...

    class Meta:
        ordering = ['-timestamp']
        db_table = 'pogoda_data'


class HistoricalWeatherData(models.Model):
    city = models.ForeignKey(
        City,
        on_delete=models.CASCADE,
        related_name='historical_readings'
    )

    temperature = models.FloatField()
    date = models.DateField()  # pierwszy dzień miesiąca
    precipitation = models.FloatField(null=True, blank=True)
    wind_speed = models.FloatField(null=True, blank=True)
    relative_humidity = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ('city', 'date')
        ordering = ['-date']
        db_table = 'pogoda_historical'

    def __str__(self):
        return f"{self.city.name}: {self.temperature}°C ({self.date})"