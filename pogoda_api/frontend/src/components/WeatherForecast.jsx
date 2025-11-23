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

const WeatherForecast = ({ city, cities = [], onCityChange }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recommendation, setRecommendation] = useState(null);

    const handleCitySelect = (e) => {
        if (onCityChange) onCityChange(e.target.value);
    };

    const fetchForecast = async (selectedCity) => {
        if (!selectedCity) return;
        setLoading(true);
        setData(null);
        setRecommendation(null);

        try {
            // NAPRAWA #1: Kodowanie nazwy miasta do użycia w URL-u
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

    // Automatyczne pobieranie prognozy po zmianie miasta
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
                label: new Date(h.time).toLocaleTimeString([], {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            }))
        : [];

    return (
        <div id="weather-forecast" style={{ marginTop: "30px" }}>
            <h2>Prognoza pogody {city ? `dla ${city}` : ""}</h2>

            {recommendation && (
                <div style={{ padding: '10px', background: '#e0f7fa', borderLeft: '5px solid #00bcd4', marginBottom: '20px', fontWeight: 'bold' }}>
                    {recommendation}
                </div>
            )}

            {cities.length > 0 && (
                <div style={{ marginBottom: "15px" }}>
                    <label>Wybierz miasto: </label>
                    <select onChange={handleCitySelect} value={city || ""}>
                        <option value="" disabled>
                            -- wybierz --
                        </option>
                        {cities.map((c, i) => (
                            <option key={i} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Opcjonalny przycisk do ręcznego pobrania */}
            <button
                onClick={() => fetchForecast(city)}
                disabled={loading || !city}
                style={{ padding: "8px 12px", marginBottom: "10px", cursor: "pointer" }}
            >
                {loading ? "Ładowanie..." : "Pobierz prognozę godzinową"}
            </button>

            {filteredData.length > 0 ? (
                <div style={{ width: "100%", height: 400 }}>
                    <ResponsiveContainer>
                        <LineChart data={filteredData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend />

                            {/* LINIA 1: TEMPERATURA */}
                            <Line
                                type="monotone"
                                dataKey="temperature"
                                name="Temperatura (°C)"
                                stroke="#ff0000"
                                yAxisId={0} // Domyślna oś Y (lewa)
                            />

                            {/* LINIA 2: WILGOTNOŚĆ */}
                            <Line
                                type="monotone"
                                dataKey="relative_humidity"
                                name="Wilgotność (%)"
                                stroke="#0088fe"
                                yAxisId={0}
                            />

                            {/* LINIA 3: WIATR */}
                            <Line
                                type="monotone"
                                dataKey="wind_speed"
                                name="Wiatr (m/s)"
                                stroke="#00c49f"
                                yAxisId={0}
                            />

                            {/* LINIA 4: OPADY */}
                            <Line
                                type="monotone"
                                dataKey="precipitation"
                                name="Opady (mm)"
                                stroke="#82ca9d"
                                yAxisId={0}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                !loading && <p>Brak danych dla aktualnej prognozy.</p>
            )}
        </div>
    );
};

export default WeatherForecast;