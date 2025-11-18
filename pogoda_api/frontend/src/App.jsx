import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WeatherTable from './components/WeatherTable';
import WeatherMap from './components/WeatherMap';
import CityHistory from './components/CityHistory';

const API_BASE = '/api/pogoda';

function App() {
  const [weatherData, setWeatherData] = useState([]);
  const [cityHistory, setCityHistory] = useState(null);
  const [currentCity, setCurrentCity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

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

  const fetchWeather = useCallback(async (refresh = false) => {
    setIsLoading(true);
    const url = refresh ? `${API_BASE}/refresh/` : API_BASE;
    let success = false;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Błąd API Django');
      const data = await response.json();

      data.sort((a, b) => b.temperature - a.temperature);
      setWeatherData(data);
      success = true;
    } catch (error) {
      console.error("Błąd pobierania danych pogodowych:", error);
      alert("Błąd pobierania danych pogodowych.");
    } finally {
      setIsLoading(false);
      setInitialLoad(false);

      if (success && currentCity) {
        loadCityHistory(currentCity);
      }
    }
  }, [currentCity, loadCityHistory]);

  useEffect(() => {
    if (initialLoad) fetchWeather(false);
  }, [fetchWeather, initialLoad]);

  return (
    <Router>
      <div className="weather-app">
        <h1>☀️ Aktualna Pogoda w Polsce</h1>

        <nav style={{ marginBottom: '15px' }}>
          <Link to="/" style={{ marginRight: '10px' }}>Tabela</Link>
          <Link to="/map" style={{ marginRight: '10px' }}>Mapa</Link>
          <Link to="/historical">Historia</Link>
        </nav>

        <button
          onClick={() => fetchWeather(true)}
          disabled={isLoading}
          style={{ padding: '10px 15px', cursor: 'pointer', marginBottom: '15px' }}
        >
          {isLoading && !initialLoad ? 'Ładowanie...' : '🔄 Odśwież dane pogodowe'}
        </button>

        <Routes>
          <Route
            path="/"
            element={<WeatherTable data={weatherData} onCityClick={loadCityHistory} />}
          />
          <Route
            path="/map"
            element={<WeatherMap data={weatherData} onMarkerClick={loadCityHistory} />}
          />
          <Route
            path="/historical"
            element={cityHistory ? <CityHistory historyData={cityHistory} /> : <p>Wybierz miasto, aby zobaczyć historię.</p>}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
