import React, { useState } from "react";

const WeatherForecast = ({ city, cities = [], onCityChange }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCitySelect = (e) => {
    if (onCityChange) onCityChange(e.target.value);
  };

  const fetchForecast = async () => {
    if (!city) return;
    setLoading(true);
    setData(null);

    try {
      const res = await fetch(`http://localhost:8000/api/pogoda/forecast/${city}/`);
      const json = await res.json();
      setData(json.hourly); // {"city": ..., "hourly": [...]}
    } catch (error) {
      console.error("Błąd pobierania prognozy:", error);
      alert("Nie udało się pobrać prognozy.");
    } finally {
      setLoading(false);
    }
  };

  // filtrujemy dane od aktualnej godziny +1 i ograniczamy do 24 godzin
  const filteredData = data
    ? data
        .filter(hour => {
          const hourTime = new Date(hour.time);
          const nowPlusOne = new Date();
          nowPlusOne.setHours(nowPlusOne.getHours() + 1);
          return hourTime >= nowPlusOne;
        })
        .slice(0, 25) // tylko 24 najbliższe godziny
    : [];

  return (
    <div id="weather-forecast" style={{ marginTop: '30px' }}>
      <h2>Prognoza pogody {city ? `dla ${city}` : ''}</h2>

      {/* 🔽 Rozwijana lista miast */}
      {cities.length > 0 && (
        <div style={{ marginBottom: '15px' }}>
          <label>Wybierz miasto: </label>
          <select onChange={handleCitySelect} value={city || ""}>
            <option value="" disabled>-- wybierz --</option>
            {cities.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* 🔽 Przycisk pobierania prognozy */}
      <button
        onClick={fetchForecast}
        disabled={loading || !city}
        style={{ padding: "8px 12px", marginBottom: "10px", cursor: "pointer" }}
      >
        {loading ? "Ładowanie..." : "Pobierz prognozę godzinową"}
      </button>

      {/* 🔽 Tabela z prognozą */}
      {filteredData.length > 0 ? (
        <table border="1" cellPadding="5" cellSpacing="0">
          <thead>
            <tr>
              <th>Godzina</th>
              <th>Temperatura (°C)</th>
              <th>Opady (mm)</th>
              <th>Wiatr (m/s)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((hour, i) => (
              <tr key={i}>
                <td>{new Date(hour.time).toLocaleString()}</td>
                <td>{hour.temperature.toFixed(1)}</td>
                <td>{hour.precipitation.toFixed(1)}</td>
                <td>{hour.wind_speed.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !loading && <p>Brak danych prognozy od aktualnej godziny +1. Kliknij przycisk, aby pobrać.</p>
      )}
    </div>
  );
};

export default WeatherForecast;
