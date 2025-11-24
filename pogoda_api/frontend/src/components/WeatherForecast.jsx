// frontend/src/components/WeatherForecast.jsx
import React, { useMemo } from "react";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from "recharts";
import { useCityForecast } from "../hooks/useWeather";

// --- KOMPONENTY POMOCNICZE ---

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
                    {dataPoint.name}: <strong>{dataPoint.value.toFixed(1)} {unit}</strong>
                </p>
            </div>
        );
    }
    return null;
};

const ForecastChart = ({ data, dataKey, name, color, unit }) => (
    <div style={{
        width: '100%',
        height: 300,
        marginBottom: '30px',
    }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>{name}</h3>
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
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

// --- GŁÓWNY KOMPONENT ---

const WeatherForecast = ({ city, latestReading }) => {
    const { forecastData, loading, error } = useCityForecast(city);

    const chartData = useMemo(() => {
        if (!forecastData || !forecastData.hourly) return [];

        const now = new Date();
        return forecastData.hourly
            .filter((hour) => new Date(hour.time) >= now)
            .slice(0, 49)
            .map((h) => ({
                ...h,
                label: new Date(h.time).toLocaleString('pl-PL', {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            }));
    }, [forecastData]);

    if (loading && !chartData.length) return <p>Ładowanie prognozy...</p>;
    if (error) return <p style={{ color: 'red' }}>Błąd prognozy: {error}</p>;

    return (
        // DODANO: padding: '0 20px' i boxSizing: 'border-box' dla marginesów bocznych
        <div id="weather-forecast" style={{
            marginTop: "30px",
            width: "100%",
            padding: "0 20px",
            boxSizing: "border-box"
        }}>

            {/* SEKCJA 1: REKOMENDACJA AI */}
            {forecastData?.recommendation && (
                <div style={{
                    padding: '15px',
                    background: '#e0f7fa',
                    borderLeft: '5px solid #00bcd4',
                    marginBottom: '25px',
                    borderRadius: '4px',
                    color: '#006064'
                }}>
                    <strong>Wskazówka:</strong> {forecastData.recommendation}
                </div>
            )}

            {/* SEKCJA 2: AKTUALNY ODCZYT */}
            {latestReading && (
                <div style={{
                    marginBottom: '40px',
                    paddingBottom: '20px',
                    borderBottom: '1px solid #ccc'
                }}>
                    <h3 style={{ margin: '0 0 15px 0' }}>
                        Aktualne warunki <small>({new Date(latestReading.last_updated).toLocaleString('pl-PL')})</small>
                    </h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', fontSize: '1.1rem' }}>
                        <div>
                            Temperatura: <strong>{latestReading.temperature.toFixed(1)}°C</strong>
                        </div>
                        <div>
                            Odczuwalna: <strong>
                            {(latestReading.perceived_temperature ?? latestReading.temperature).toFixed(1)}°C
                        </strong>
                        </div>
                        <div>
                            Wiatr: <strong>{latestReading.wind_speed.toFixed(1)} m/s</strong>
                        </div>
                        <div>
                            Wilgotność: <strong>{latestReading.relative_humidity.toFixed(0)}%</strong>
                        </div>
                    </div>
                </div>
            )}

            {/* SEKCJA 3: WYKRESY */}
            {chartData.length > 0 ? (
                <div style={{ width: '100%' }}>
                    <ForecastChart
                        data={chartData}
                        dataKey="temperature"
                        name="Temperatura"
                        color="#ff0000"
                        unit="°C"
                    />
                    <ForecastChart
                        data={chartData}
                        dataKey="precipitation"
                        name="Opady"
                        color="#0088fe"
                        unit="mm"
                    />
                    <ForecastChart
                        data={chartData}
                        dataKey="wind_speed"
                        name="Wiatr"
                        color="#00c49f"
                        unit="m/s"
                    />
                    <ForecastChart
                        data={chartData}
                        dataKey="relative_humidity"
                        name="Wilgotność"
                        color="#ffbb2c"
                        unit="%"
                    />
                </div>
            ) : (
                <p>Brak danych prognozy do wyświetlenia.</p>
            )}
        </div>
    );
};

export default WeatherForecast;