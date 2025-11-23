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

  const handleCitySelect = (e) => {
    if (onCityChange) onCityChange(e.target.value);
  };

  const fetchForecast = async (selectedCity) => {
    if (!selectedCity) return;
    setLoading(true);
    setData(null);

    try {
      const res = await fetch(`http://localhost:8000/api/pogoda/forecast/${selectedCity}/`);
      const json = await res.json();
      setData(json.hourly);
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
              <Line
                type="monotone"
                dataKey="temperature"
                name="Temperatura (°C)"
                stroke="red"
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
