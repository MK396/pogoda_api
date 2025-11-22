import React, { useState, useEffect } from "react";

const WeatherForecast = ({ city }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!city) return;

    fetch(`http://localhost:8000/api/forecast/${city}/`)
      .then(res => res.json())
      .then(json => setData(json));
  }, [city]);

  if (!city) return <p>Wybierz miasto...</p>;
  if (!data) return <p>Ładowanie prognozy...</p>;

  // Teraz `data` jest tablicą obiektów {time, temperature, precipitation, wind_speed}
  return (
    <div>
      <h2>Prognoza: {city}</h2>
      {data.map((hour, i) => (
        <div key={i} style={{ marginBottom: "5px" }}>
          <b>{hour.time}</b> — {hour.temperature.toFixed(1)}°C,
          opady: {hour.precipitation.toFixed(1)} mm,
          wiatr: {hour.wind_speed.toFixed(1)} m/s
        </div>
      ))}
    </div>
  );
};

export default WeatherForecast;
