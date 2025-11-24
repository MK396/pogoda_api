import React from 'react';
// Importujemy hooka, który zawiera całą logikę pobierania danych
import { useCityHistory } from '../hooks/useWeather';

const CityHistory = ({ currentCity }) => {
    // Zamiast definiować stany i useEffect tutaj, pobieramy gotowe dane z hooka
    const { historyData, loading, error } = useCityHistory(currentCity);

    if (loading) {
        return (
            <div id="city-history" style={{ marginTop: '30px' }}>
                <p>Ładowanie historii dla {currentCity}...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div id="city-history" style={{ marginTop: '30px', color: 'red' }}>
                <p>Błąd: {error}</p>
            </div>
        );
    }

    if (!historyData || !historyData.history || historyData.history.length === 0) {
        return (
            <div id="city-history" style={{ marginTop: '30px' }}>
                <h2>Historia pogody {currentCity ? `dla ${currentCity}` : ''}</h2>
                <p>Brak danych historycznych do wyświetlenia dla tego miasta.</p>
            </div>
        );
    }

    const { city_name, history } = historyData;

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

                        <td>
                            {record.temperature != null
                                ? record.temperature.toFixed(1) : '-'}
                        </td>
                        <td>
                            {record.precipitation != null
                                ? record.precipitation.toFixed(1) : '-'}
                        </td>
                        <td>
                            {record.wind_speed != null
                                ? record.wind_speed.toFixed(1) : '-'}
                        </td>
                        <td>
                            {record.relative_humidity != null
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