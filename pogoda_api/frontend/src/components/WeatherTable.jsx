import React, { memo } from 'react';
import { Link } from 'react-router-dom';

// --- FUNKCJE POMOCNICZE (FORMATOWANIE) ---

// Bezpieczne formatowanie liczb (zabezpieczenie przed null)
const formatValue = (value, precision = 1, suffix = '') => {
    if (value === null || value === undefined) return '-';
    return `${value.toFixed(precision)}${suffix}`;
};

// Formatowanie daty
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pl-PL');
};

// --- KOMPONENT WIERSZA (ROW) ---
// Używamy memo, aby nie przerysowywać wierszy, które się nie zmieniły
const WeatherTableRow = memo(({ item }) => {
    // Logika wyboru temperatury odczuwalnej (jeśli null, użyj zwykłej)
    const perceivedTemp = item.perceived_temperature ?? item.temperature;

    return (
        <tr>
            <td className="city-name">
                <Link
                    to={`/pogoda/${encodeURIComponent(item.city_name)}`}
                    title={`Kliknij, aby zobaczyć historię dla ${item.city_name}`}
                    style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
                >
                    {item.city_name}
                </Link>
            </td>

            {/* Temperatura */}
            <td>{formatValue(item.temperature, 1)}</td>

            {/* Temperatura odczuwalna */}
            <td style={{ color: '#555' }}>
                {formatValue(perceivedTemp, 1)}
            </td>

            {/* Opady */}
            <td>{formatValue(item.precipitation, 1)}</td>

            {/* Wiatr */}
            <td>{formatValue(item.wind_speed, 1)}</td>

            {/* Wilgotność */}
            <td>{formatValue(item.relative_humidity, 0)}</td>

            {/* Ostatnia aktualizacja */}
            <td style={{ fontSize: '0.85rem', color: '#888' }}>
                {formatDate(item.last_updated)}
            </td>
        </tr>
    );
});

// --- GŁÓWNY KOMPONENT TABELI ---

const WeatherTable = ({ data }) => {
    const hasData = data && data.length > 0;

    return (
        <div style={{ overflowX: 'auto' }}> {/* Zabezpieczenie na małe ekrany */}
            <table id="weather-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr>
                    <th style={{ textAlign: 'left' }}>Miasto</th>
                    <th>Temp. (°C)</th>
                    <th>Odczuwalna (°C)</th>
                    <th>Opady (mm)</th>
                    <th>Wiatr (m/s)</th>
                    <th>Wilgotność (%)</th>
                    <th>Aktualizacja</th>
                </tr>
                </thead>
                <tbody>
                {!hasData ? (
                    <tr>
                        {/* Poprawiono colSpan na 7, bo mamy 7 kolumn */}
                        <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                            Ładowanie danych lub brak danych...
                        </td>
                    </tr>
                ) : (
                    data.map((item) => (
                        <WeatherTableRow key={item.city_name} item={item} />
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};

export default WeatherTable;