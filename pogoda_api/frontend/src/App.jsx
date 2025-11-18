import React, { useState, useEffect, useCallback } from 'react';
import WeatherTable from './components/WeatherTable';
import WeatherMap from './components/WeatherMap';
import CityHistory from './components/CityHistory';

const API_BASE = '/api/pogoda';

function App() {
  const [weatherData, setWeatherData] = useState([]);
  const [cityHistory, setCityHistory] = useState(null);
  const [currentCity, setCurrentCity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Stan pomocniczy do śledzenia, czy dane zostały załadowane po raz pierwszy
  const [initialLoad, setInitialLoad] = useState(true);

  // 1. Funkcja do ładowania historii miasta (Bez zmian)
  const loadCityHistory = useCallback(async (cityName) => {
    setCurrentCity(cityName);
    try {
      const response = await fetch(`${API_BASE}/history/${cityName}/`);
      if (!response.ok) throw new Error('Nie znaleziono historii miasta');
      const data = await response.json();
      setCityHistory(data);
    } catch (error) {
      console.error("Błąd ładowania historii:", error);
      alert(`Nie udało się pobrać historii dla ${cityName}`);
    }
  }, []);

  // 2. Funkcja do ładowania/odświeżania aktualnych danych
  const fetchWeather = useCallback(async (refresh = false) => {
    setIsLoading(true);
    const url = refresh ? `${API_BASE}/refresh/` : API_BASE;
    let success = false;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Błąd API Django');
      const data = await response.json();

      // Sortowanie danych
      data.sort((a, b) => b.temperature - a.temperature);
      setWeatherData(data);
      success = true;

    } catch (error) {
      console.error("Błąd pobierania danych pogodowych:", error);
      alert("Błąd pobierania danych pogodowych.");

    } finally {
      setIsLoading(false);
      setInitialLoad(false); // Pierwsze ładowanie zakończone

      // Jeśli sukces, i jest wybrane miasto, odświeżamy jego historię.
      // Wywołanie musi być tutaj, aby uniknąć zależności currentCity/loadCityHistory
      // w tablicy zależności fetchWeather.
      if (success && currentCity) {
          loadCityHistory(currentCity);
      }
    }
  }, [currentCity, loadCityHistory]); // Nadal wymaga currentCity, jeśli historia ma się odświeżać

  // 3. Efekt do pierwszego ładowania danych
  useEffect(() => {
    if (initialLoad) {
        fetchWeather(false);
    }
    // Używamy initialLoad jako flagi, aby uruchomić to tylko raz.
  }, [fetchWeather, initialLoad]);

  return (
    <div className="weather-app">
      <h1>☀️ Aktualna Pogoda w Polsce</h1>

      {/* Przycisk odświeżania */}
      <button
        onClick={() => fetchWeather(true)}
        disabled={isLoading}
        style={{ padding: '10px 15px', cursor: 'pointer', margin: '10px 0' }}
      >
        {isLoading && !initialLoad ? 'Ładowanie...' : '🔄 Odśwież dane pogodowe'}
      </button>

      {/* Komponenty */}
      <WeatherTable data={weatherData} onCityClick={loadCityHistory} isLoading={isLoading} />
      <WeatherMap data={weatherData} onMarkerClick={loadCityHistory} />
      {cityHistory && <CityHistory historyData={cityHistory} />}
    </div>
  );
}

export default App;