// frontend/src/pages/CityDetailPage.jsx
import React from 'react';
// IMPORTUJEMY NARZĘDZIA DO POBIERANIA PARAMETRÓW URL
import { useParams, useNavigate } from 'react-router-dom';

import CityHistory from '../components/CityHistory';
import WeatherForecast from '../components/WeatherForecast';

const CityDetailPage = () => {
    // useParams() pobiera parametr ':city' zdefiniowany w App.jsx
    const { city: city_name_encoded } = useParams();
    const navigate = useNavigate();

    if (!city_name_encoded) {
        return <div>Błąd: Nie podano nazwy miasta w adresie URL.</div>;
    }

    // Ważne: Dekodowanie nazwy miasta, aby obsłużyć spacje, polskie znaki itp.
    const decodedCityName = decodeURIComponent(city_name_encoded);

    return (
        <div className="city-detail-page">
            <button onClick={() => navigate('/')} className="back-button">
                &larr; Powrót do Strony Głównej
            </button>

            <h1>Szczegóły Pogody dla {decodedCityName}</h1>

            <section className="weather-detail-section">
                <h2>Prognoza Godzinowa (48h)</h2>
                <WeatherForecast city={decodedCityName} />
            </section>

            <section className="weather-detail-section">
                <h2>Historia Temperatur (Ostatnie 30 dni)</h2>
                <CityHistory currentCity={decodedCityName} />
            </section>
        </div>
    );
};

export default CityDetailPage;