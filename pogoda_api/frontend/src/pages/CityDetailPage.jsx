// src/pages/CityDetailPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Importujemy hooki
import { useRefreshedCityWeather } from '../hooks/useWeather';

import CityHistory from '../components/CityHistory';
import WeatherForecast from '../components/WeatherForecast';

const CityDetailPage = () => {
    const { city: city_name_encoded } = useParams();
    const navigate = useNavigate();

    // Dekodowanie nazwy miasta
    const decodedCityName = decodeURIComponent(city_name_encoded);

    // Używamy hooka do pobrania najnowszego odczytu (z endpointu /refresh/)
    const { latestReading, loading: isLoadingDetails } = useRefreshedCityWeather(decodedCityName);

    if (!decodedCityName) {
        return <div>Błąd: Nie podano nazwy miasta w adresie URL.</div>;
    }

    if (isLoadingDetails) {
        return <div>Ładowanie danych miasta...</div>;
    }

    return (
        <div className="city-detail-page">
            <button
                onClick={() => navigate('/')}
                className="back-button"
                style={{ marginBottom: '20px', padding: '5px 10px', cursor: 'pointer' }}
            >
                &larr; Powrót do Strony Głównej
            </button>

            <h1>Szczegóły Pogody dla {decodedCityName}</h1>

            <section className="weather-detail-section">
                <h2>Prognoza Godzinowa (48h)</h2>

                {/* Przekazujemy latestReading do komponentu prognozy, aby obsłużyć ostrzeżenia */}
                <WeatherForecast
                    city={decodedCityName}
                    latestReading={latestReading}
                />
            </section>

            <section className="weather-detail-section">
                <h2>Historia Temperatur (Ostatnie 30 dni)</h2>
                <CityHistory currentCity={decodedCityName} />
            </section>
        </div>
    );
};

export default CityDetailPage;