import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import WeatherTable from './components/WeatherTable';
import WeatherMap from './components/WeatherMap';
import CityHistory from './components/CityHistory';
import WeatherForecast from './components/WeatherForecast';

const API_BASE = '/api/pogoda';

function App() {
  const [weatherData, setWeatherData] = useState([]);
  const [cityHistory, setCityHistory] = useState(null);
  const [currentCity, setCurrentCity] = useState(null);
  const [forecastCity, setForecastCity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const navigate = useNavigate();

  // ========================
  // Pobieranie historii miasta
  // ========================
  const loadCityHistory = useCallback(async (cityName, navigateTo = true) => {
    setCurrentCity(cityName);
    setForecastCity(cityName);

    if (navigateTo) {
      navigate('/historical');
    }

    try {
      const response = await fetch(`${API_BASE}/history/${cityName}/`);
      if (!response.ok) throw new Error('Nie znaleziono historii miasta');
      const data = await response.json();
      setCityHistory(data);
    } catch (error) {
      console.error("Błąd ładowania historii:", error);
      alert(`Nie udało się pobrać historii dla ${cityName}`);
    }
  }, [navigate]);

  // ========================
  // Pobieranie pogody
  // ========================
  const fetchWeather = useCallback(async (refresh = false) => {
    setIsLoading(true);
    const url = refresh ? `${API_BASE}/refresh/` : API_BASE;
    let success = false;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Błąd API');
      const data = await response.json();

      data.sort((a, b) => b.temperature - a.temperature);
      setWeatherData(data);
      success = true;
    } catch (error) {
      console.error("Błąd pobierania pogody:", error);
      alert("Błąd pobierania danych pogodowych.");
    } finally {
      setIsLoading(false);
      setInitialLoad(false);

      // jeśli było wybrane miasto – odśwież historię **bez nawigacji**
      if (success && currentCity) {
        loadCityHistory(currentCity, false);
      }
    }
  }, [currentCity, loadCityHistory]);

  // ========================
  // Ładowanie początkowe
  // ========================
  useEffect(() => {
    if (initialLoad) fetchWeather(false);
  }, [fetchWeather, initialLoad]);

  const cityList = weatherData.map(c => c.city_name);

  return (
    <div className="weather-app">
      <h1>☀️ Aktualna Pogoda w Polsce</h1>

      <nav style={{ marginBottom: '15px' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Tabela</Link>
        <Link to="/map" style={{ marginRight: '10px' }}>Mapa</Link>
        <Link to="/historical" style={{ marginRight: '10px' }}>Historia</Link>
        <Link to="/forecast">Prognoza</Link>
      </nav>

      <button
        onClick={() => fetchWeather(true)}
        disabled={isLoading}
        style={{ padding: '10px 15px', cursor: "pointer", marginBottom: '15px' }}
      >
        {isLoading && !initialLoad ? 'Ładowanie...' : '🔄 Odśwież dane pogodowe'}
      </button>

      <Routes>
        <Route
          path="/"
          element={<WeatherTable data={weatherData} onCityClick={(city) => loadCityHistory(city)} />}
        />
        <Route
          path="/map"
          element={<WeatherMap data={weatherData} onMarkerClick={(city) => loadCityHistory(city)} />}
        />
        <Route
          path="/historical"
          element={
            <CityHistory
              historyData={cityHistory}
              cities={cityList}
              onCityChange={(city) => loadCityHistory(city)}
              currentCity={currentCity}
            />
          }
        />
        <Route
          path="/forecast"
          element={
            <WeatherForecast
              city={forecastCity}
              cities={cityList}
              onCityChange={(cityName) => {
                setForecastCity(cityName);
                setCurrentCity(cityName); // synchronizacja z historią
              }}
            />
          }
        />
      </Routes>
    </div>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
