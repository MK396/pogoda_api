import React, { useState, useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";




const CustomTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0];

        return (
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '10px',
                border: '1px solid #ccc',
                color: '#333',
                fontSize: '14px',
                lineHeight: '1.4'
            }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{`Data i godzina: ${label}`}</p>

                <p style={{ margin: 0 }}>{`${dataPoint.name}: ${dataPoint.value.toFixed(1)} ${unit}`}</p>
            </div>
        );
    }
    return null;
};

const ForecastChart = ({ data, dataKey, name, color, unit }) => (
    <div style={{
        width: '50%',
        minWidth: '400px',
        height: 350,
        margin: '10px',
        padding: '10px',
        border: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
    }}>
        <h3 style={{ margin: '0 0 5px 0' }}>{name}</h3>

        <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                        dataKey="label"
                        angle={-45}
                        textAnchor="end"
                        interval={Math.floor(data.length / 5)}
                        height={50}
                    />

                    <YAxis label={{ value: unit, angle: -90, position: 'insideLeft' }} />

                    <Tooltip content={<CustomTooltip unit={unit} />} />

                    <Legend />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        name={name}
                        stroke={color}
                        dot={false}
                        strokeWidth={2}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);


const WeatherForecast = ({ city }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recommendation, setRecommendation] = useState(null);

    

    const fetchForecast = async (selectedCity) => {
        if (!selectedCity) return;
        setLoading(true);
        setData(null);
        setRecommendation(null); // Reset rekomendacji

        try {
            const encodedCity = encodeURIComponent(selectedCity);

            const res = await fetch(`http://localhost:8000/api/pogoda/forecast/${encodedCity}/`);

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const json = await res.json();
            setData(json.hourly);
            setRecommendation(json.recommendation);

        } catch (error) {
            console.error("Błąd pobierania prognozy:", error);
            alert("Nie udało się pobrać prognozy.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (city) {
            fetchForecast(city);
        }
    }, [city]);

    const filteredData = data
        ? data
            .filter((hour) => {
                const hourTime = new Date(hour.time);
                const nowPlusOne = new Date();
                nowPlusOne.setHours(nowPlusOne.getHours() + 1);
                return hourTime >= nowPlusOne;
            })
            .slice(0, 49)
            .map((h) => ({
                ...h,
                label: new Date(h.time).toLocaleString('pl-PL', {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            }))
        : [];

    const currentData = filteredData.length > 0 ? filteredData[0] : null;

    return (
        <div id="weather-forecast" style={{ marginTop: "30px" }}>
            <h2>Prognoza pogody dla **{city}**</h2>

            {/* SMART FEATURE: REKOMENDACJA AKTYWNOŚCI */}
            {recommendation && (
                <div style={{
                    padding: '10px',
                    background: '#e0f7fa',
                    borderLeft: '5px solid #00bcd4',
                    marginBottom: '20px',
                    fontWeight: 'bold',
                    color: '#333'
                }}>
                    {recommendation}
                </div>
            )}

            {/* AKTUALNA POGODA (na podstawie najbliższego punktu prognozy) */}
            {currentData && (
                <div style={{
                    marginBottom: '30px',
                    padding: '15px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9',
                    color: '#333' // Ustawienie ciemnego koloru tekstu dla widoczności
                }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#0056b3' }}>Aktualna Pogoda ({currentData.label})</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        <p style={{ margin: 0 }}>
                            **Temperatura:** **{currentData.temperature.toFixed(1)}°C**
                        </p>
                        <p style={{ margin: 0 }}>
                            **Odczuwalna:** **{(currentData.perceived_temperature !== null ? currentData.perceived_temperature : currentData.temperature).toFixed(1)}°C**
                        </p>
                        <p style={{ margin: 0 }}>
                            **Wiatr:** {currentData.wind_speed.toFixed(1)} m/s
                        </p>
                        <p style={{ margin: 0 }}>
                            **Wilgotność:** {currentData.relative_humidity.toFixed(0)}%
                        </p>
                    </div>
                </div>
            )}

            {/* KONTENER DLA CZTERECH POWIĘKSZONYCH WYKRESÓW */}
            {filteredData.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>

                    <ForecastChart
                        data={filteredData}
                        dataKey="temperature"
                        name="Temperatura"
                        color="#ff0000"
                        unit="°C"
                    />

                    <ForecastChart
                        data={filteredData}
                        dataKey="precipitation"
                        name="Opady"
                        color="#0088fe"
                        unit="mm"
                    />

                    <ForecastChart
                        data={filteredData}
                        dataKey="wind_speed"
                        name="Prędkość Wiatru"
                        color="#00c49f"
                        unit="m/s"
                    />

                    <ForecastChart
                        data={filteredData}
                        dataKey="relative_humidity"
                        name="Wilgotność"
                        color="#ffbb2c"
                        unit="%"
                    />
                </div>
            ) : (
                !loading && <p>Brak danych dla prognozy.</p>
            )}
        </div>
    );
};

export default WeatherForecast;