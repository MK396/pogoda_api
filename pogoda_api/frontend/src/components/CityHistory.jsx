import React, { useState, useEffect } from 'react';

// Ten komponent jest odpowiedzialny za samodzielne pobieranie danych i ich wyświetlanie.
const CityHistory = ({ currentCity }) => {
    // Stan przechowujący pobrane dane historii
    const [historyData, setHistoryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHistory = async (city) => {
        if (!city) return;
        setLoading(true);
        setHistoryData(null);
        setError(null);

        try {
            // Kodowanie nazwy miasta
            const encodedCity = encodeURIComponent(city);
            // Weryfikacja adresu URL API
            const res = await fetch(`http://127.0.0.1:8000/api/pogoda/history/${encodedCity}/`);

            if (res.status === 404) {
                // Jeśli miasto nie ma historii (ale jest w bazie), możemy zwrócić pusty wynik
                setHistoryData({ city_name: city, history: [] });
                return;
            }

            if (!res.ok) {
                // Rzucamy błąd, jeśli status to np. 500
                throw new Error(`Błąd HTTP: ${res.status}`);
            }

            const json = await res.json();
            // Sprawdzenie, czy pole 'history' istnieje, aby uniknąć błędu
            if (!json.history) {
                throw new Error("Brak pola 'history' w odpowiedzi API.");
            }
            setHistoryData(json);

        } catch (e) {
            console.error("Błąd pobierania historii:", e);
            setError(`Nie udało się pobrać danych historycznych: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Używamy useEffect, aby pobrać dane za każdym razem, gdy zmieni się miasto
    useEffect(() => {
        if (currentCity) {
            fetchHistory(currentCity);
        }
    }, [currentCity]);

    // --- Renderowanie stanu ŁADOWANIA/BŁĘDU ---
    if (loading) {
        return <div id="city-history" style={{ marginTop: '30px' }}><p>Ładowanie historii dla {currentCity}...</p></div>;
    }

    if (error) {
        return <div id="city-history" style={{ marginTop: '30px', color: 'red' }}><p>Błąd: {error}</p></div>;
    }

    // --- Renderowanie stanu PUSTEJ HISTORII ---
    if (!historyData || !historyData.history || historyData.history.length === 0) {
        return (
            <div id="city-history" style={{ marginTop: '30px' }}>
                <h2>Historia pogody {currentCity ? `dla ${currentCity}` : ''}</h2>
                <p>Brak danych historycznych do wyświetlenia dla tego miasta.</p>
            </div>
        );
    }

    const { city_name, history } = historyData;

    // --- Renderowanie TABELI ---
    return (
        <div id="city-history" style={{ marginTop: '30px' }}>
            <h2>Historia pogody dla {city_name}</h2>

            <table border="1" cellPadding="5" cellSpacing="0">
                <thead>
                <tr>
                    <th>Data</th>
                    <th>Temperatura (°C)</th>
                    <th>Opady (mm)</th>
                    <th>Wiatr (m/s)</th>
                    <th>Wilgotność (%)</th>
                </tr>
                </thead>
                <tbody>
                {history.map((record, index) => (
                    <tr key={record.timestamp || index}>
                        <td>{new Date(record.timestamp).toLocaleString()}</td>

                        {/* Formatowanie temperatury z zabezpieczeniem przed null/undefined */}
                        <td>
                            {record.temperature !== null && record.temperature !== undefined
                                ? record.temperature.toFixed(1) : '-'}
                        </td>

                        {/* Formatowanie opadów z zabezpieczeniem */}
                        <td>
                            {record.precipitation !== null && record.precipitation !== undefined
                                ? record.precipitation.toFixed(1) : '-'}
                        </td>

                        {/* Formatowanie wiatru z zabezpieczeniem */}
                        <td>
                            {record.wind_speed !== null && record.wind_speed !== undefined
                                ? record.wind_speed.toFixed(1) : '-'}
                        </td>

                        {/* Formatowanie wilgotności z zabezpieczeniem */}
                        <td>
                            {record.relative_humidity !== null && record.relative_humidity !== undefined
                                ? record.relative_humidity.toFixed(0) : '-'}
                        </td>

                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CityHistory;