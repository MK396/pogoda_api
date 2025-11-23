// frontend/src/components/WeatherTable.jsx
import React from 'react';
import { Link } from 'react-router-dom';


const WeatherTable = ({ data }) => {
    return (
        <table id="weather-table">
            <thead>
                <tr>
                    <th>Miasto</th>
                    <th>Temperatura (°C)</th>
                    <th>Odczuwalna Temp. (°C)</th> {/* NOWY NAGŁÓWEK */}
                    <th>Opady (mm)</th>
                    <th>Wiatr (m/s)</th>
                    <th>Wilgotność (%)</th>
                    <th>Ostatnia Aktualizacja</th>
                </tr>
            </thead>
            <tbody>
                {data.length === 0 ? (
                    <tr><td colSpan="6">Ładowanie danych lub brak danych...</td></tr>
                ) : (
                    data.map(item => (
                        <tr key={item.city_name}>
                            <td className="city-name">

                                <Link
                                    to={`/pogoda/${encodeURIComponent(item.city_name)}`}
                                    title={`Kliknij, aby zobaczyć historię dla ${item.city_name}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    {item.city_name}
                                </Link>

                            </td>
                            <td>{item.temperature.toFixed(1)}</td>
                            <td>
                                {item.perceived_temperature !== null
                                    ? item.perceived_temperature.toFixed(1)
                                    : item.temperature.toFixed(1)}
                            </td>
                            <td>{item.precipitation.toFixed(1)}</td>
                            <td>{item.wind_speed.toFixed(1)}</td>
                            <td>{item.relative_humidity.toFixed(0)}</td>
                            <td>{new Date(item.last_updated).toLocaleString()}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default WeatherTable;