// frontend/src/pages/CityDetailPage.jsx
import React, { useState, useEffect } from 'react'; // DODANO useState, useEffect
import { useParams, useNavigate } from 'react-router-dom';

import CityHistory from '../components/CityHistory';
import WeatherForecast from '../components/WeatherForecast';

// Używamy endpointu, który zwraca listę aktualnych, odświeżonych danych dla WSZYSTKICH miast.
const ALL_CURRENT_API_URL = "http://127.0.0.1:8000/api/pogoda/refresh/";

const CityDetailPage = () => {
    const { city: city_name_encoded } = useParams();
    const navigate = useNavigate();
    const decodedCityName = decodeURIComponent(city_name_encoded);

    // NOWY STAN: do przechowywania pojedynczego, najnowszego odczytu z listy głównej
    const [latestReading, setLatestReading] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(true);

    // NOWA FUNKCJA: Pobiera listę miast i filtruje ten jeden rekord
    const fetchCityDetails = async (city) => {
        setIsLoadingDetails(true);
        try {
            // 1. Pobierz listę wszystkich najnowszych odczytów
            const listResponse = await fetch(ALL_CURRENT_API_URL);
            if (!listResponse.ok) {
                throw new Error(`HTTP error! status: ${listResponse.status}`);
            }
            const listData = await listResponse.json();

            // 2. Znajdź miasto pasujące do URL
            const matchedCity = listData.find(item => item.city_name === city);

            // 3. Zapisz najnowszy odczyt
            setLatestReading(matchedCity);

        } catch (e) {
            console.error("Błąd pobierania aktualnych danych dla detali:", e);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    useEffect(() => {
        fetchCityDetails(decodedCityName);
    }, [decodedCityName]);


    if (isLoadingDetails) {
        return <div>Ładowanie danych miasta...</div>;
    }


    return (
        <div className="city-detail-page">
            <button onClick={() => navigate('/')} className="back-button">
                &larr; Powrót do Strony Głównej
            </button>

            <h1>Szczegóły Pogody dla {decodedCityName}</h1>

            <section className="weather-detail-section">
                <h2>Prognoza Godzinowa (48h)</h2>

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