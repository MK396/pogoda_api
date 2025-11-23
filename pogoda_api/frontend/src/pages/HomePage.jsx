// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import WeatherMap from '../components/WeatherMap';
import WeatherTable from '../components/WeatherTable';

// Zakładamy, że baza API to http://127.0.0.1:8000/api/
const API_URL = "http://127.0.0.1:8000/api/pogoda/";

const HomePage = () => {
    // Stan i logikę pobierania danych przenosimy z App.jsx
    const [currentWeather, setCurrentWeather] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCurrentWeather = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCurrentWeather(data);
            setIsLoading(false);
        } catch (e) {
            console.error("Fetching current weather failed:", e);
            setError("Nie udało się pobrać aktualnych danych pogodowych.");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentWeather();
        // Odświeżanie co 5 minut (300 000 ms)
        const intervalId = setInterval(fetchCurrentWeather, 300000);

        return () => clearInterval(intervalId);
    }, []);

    if (isLoading && currentWeather.length === 0) return <div>Ładowanie aktualnych danych...</div>;
    if (error && currentWeather.length === 0) return <div style={{ color: 'red' }}>Błąd: {error}</div>;

    return (
        <main>
            <h1>Aktualna Pogoda w Polsce</h1>
            <div className="map-and-table-container">
                {/* Nie przekazujemy już onCityClick, bo routing jest w mapie/tabeli */}
                <WeatherMap data={currentWeather} />
                <WeatherTable data={currentWeather} />
            </div>
            <button onClick={fetchCurrentWeather} disabled={isLoading}>
                {isLoading ? 'Odświeżanie...' : 'Odśwież teraz'}
            </button>
        </main>
    );
};

export default HomePage;