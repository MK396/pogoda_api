# pogoda_app/serializers.py
from rest_framework import serializers
from .models import WeatherData, City
from .utils import calculate_perceived_temp


# 1. Serializer dla pojedynczego rekordu historycznego/detalu
class WeatherDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherData
        fields = (
            'temperature',
            'timestamp',
            'precipitation',
            'wind_speed',
            'relative_humidity'
        )

# 2. Serializer dla najnowszej pogody (listy miast)
class CurrentWeatherSerializer(serializers.ModelSerializer):
    """
    Serializuje najnowsze odczyty pogody. Używany do głównej tabeli i mapy.
    """
    city_name = serializers.CharField(source='city.name')
    latitude = serializers.FloatField(source='city.latitude')
    longitude = serializers.FloatField(source='city.longitude')
    last_updated = serializers.DateTimeField(source='timestamp')

    perceived_temperature = serializers.SerializerMethodField()

    def get_perceived_temperature(self, obj):
        """Kalkuluje odczuwalną temperaturę na podstawie pól modelu WeatherData."""
        temp = obj.temperature
        humidity = obj.relative_humidity
        wind = obj.wind_speed

        if temp is None:
            return None

        return calculate_perceived_temp(temp, humidity, wind)  # Użycie nowej funkcji

    # Dodanie tych pól, aby były dostępne w 'weatherData' dla tabeli i mapy
    precipitation = serializers.FloatField()
    wind_speed = serializers.FloatField()
    relative_humidity = serializers.FloatField()

    class Meta:
        model = WeatherData
        fields = (
            'city_name',
            'latitude',
            'longitude',
            'temperature',
            'perceived_temperature', # DODANE NOWE POLE DO FIELDS
            'last_updated',
            'precipitation',
            'wind_speed',
            'relative_humidity'
        )


# 3. Serializer dla pełnej historii miasta (detal)
class CityHistorySerializer(serializers.ModelSerializer):
    """
    Serializuje szczegóły miasta z historią pobraną z tabeli WeatherData.
    """
    # source='weather_readings' wskazuje na relację w modelu WeatherData (related_name='weather_readings')
    history = WeatherDetailSerializer(many=True, read_only=True, source='weather_readings')
    city_name = serializers.CharField(source='name')

    class Meta:
        model = City
        fields = ('city_name', 'latitude', 'longitude', 'history')