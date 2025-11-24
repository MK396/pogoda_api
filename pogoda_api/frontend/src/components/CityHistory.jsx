import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { useCityHistory } from '../hooks/useWeather';

// --- KOMPONENTY POMOCNICZE (Wykresy i Tooltipy) ---

const CustomTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0];
        return (
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '10px',
                border: '1px solid #ccc',
                color: '#333',
                fontSize: '14px'
            }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}</p>
                <p style={{ margin: 0 }}>
                    {dataPoint.name}: <strong>{dataPoint.value?.toFixed(1) ?? '-'} {unit}</strong>
                </p>
            </div>
        );
    }
    return null;
};

// Generyczny komponent wykresu (podobny do tego z WeatherForecast)
const HistoryChart = ({ data, dataKey, name, color, unit }) => (
    <div style={{
        width: '100%',
        height: 300,
        marginBottom: '40px',
    }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#444' }}>{name}</h3>
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                        dataKey="label"
                        angle={-45}
                        textAnchor="end"
                        interval="preserveStartEnd"
                        height={60}
                        tick={{ fontSize: 12 }}
                    />
                    <YAxis
                        label={{ value: unit, angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip unit={unit} />} />
                    <Legend verticalAlign="top" height={36} />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        name={name}
                        stroke={color}
                        dot={false}
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                        connectNulls // Łączy punkty, jeśli gdzieś brakuje danych (null)
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

// --- GŁÓWNY KOMPONENT ---

const CityHistory = ({ currentCity }) => {
    // 1. Pobieramy dane z hooka
    const { historyData, loading, error } = useCityHistory(currentCity);

    // 2. Przetwarzamy dane (memoizacja)
    const chartData = useMemo(() => {
        if (!historyData || !historyData.history || historyData.history.length === 0) {
            return [];
        }

        // Sortujemy chronologicznie (od najstarszych) i formatujemy datę
        return [...historyData.history]
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map((record) => ({
                ...record,
                label: new Date(record.timestamp).toLocaleString('pl-PL', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
            }));
    }, [historyData]);

    // Obsługa stanów
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

    if (chartData.length === 0) {
        return (
            <div id="city-history" style={{ marginTop: '30px' }}>
                <h2>Historia pogody {currentCity ? `dla ${currentCity}` : ''}</h2>
                <p>Brak danych historycznych do wyświetlenia.</p>
            </div>
        );
    }

    // Renderowanie wykresów
    return (
        <div id="city-history" style={{
            marginTop: '30px',
            width: '100%',
            padding: '0 20px',    // Marginesy boczne, tak jak w prognozie
            boxSizing: 'border-box'
        }}>
            {/* Tytuł sekcji zostaje w CityDetailPage, tutaj same wykresy */}

            <HistoryChart
                data={chartData}
                dataKey="temperature"
                name="Temperatura Historyczna"
                color="#d32f2f" // Ciemniejszy czerwony dla historii
                unit="°C"
            />

            <HistoryChart
                data={chartData}
                dataKey="precipitation"
                name="Opady"
                color="#1976d2" // Ciemniejszy niebieski
                unit="mm"
            />

            <HistoryChart
                data={chartData}
                dataKey="wind_speed"
                name="Prędkość Wiatru"
                color="#388e3c" // Ciemniejszy zielony
                unit="m/s"
            />

            <HistoryChart
                data={chartData}
                dataKey="relative_humidity"
                name="Wilgotność"
                color="#fbc02d" // Ciemniejszy żółty
                unit="%"
            />
        </div>
    );
};

export default CityHistory;