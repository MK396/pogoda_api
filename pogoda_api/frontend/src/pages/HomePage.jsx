import React from 'react';
import WeatherMap from '../components/WeatherMap';
import WeatherTable from '../components/WeatherTable';
import { useCurrentWeather } from '../hooks/useWeather';

const HomePage = () => {
    // Cała logika zamknięta w jednej linijce:
    const { data: currentWeather, loading, error, refetch } = useCurrentWeather();

    if (loading && currentWeather.length === 0) return <div>Ładowanie aktualnych danych...</div>;
    if (error && currentWeather.length === 0) return <div style={{ color: 'red' }}>Błąd: {error}</div>;

    return (
        <main>
            <h1>Aktualna Pogoda w Polsce</h1>
            <div className="map-and-table-container">
                <WeatherMap data={currentWeather} />
                <WeatherTable data={currentWeather} />
            </div>
            <button onClick={refetch} disabled={loading} style={{ marginTop: '20px', padding: '10px' }}>
                {loading ? 'Odświeżanie...' : 'Odśwież teraz'}
            </button>
        </main>
    );
};

export default HomePage;