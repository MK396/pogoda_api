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
                    <th>Opady (mm)</th>         {/* NOWA KOLUMNA: precipitation */}
                    <th>Wiatr (m/s)</th>       {/* NOWA KOLUMNA: wind_speed */}
                    <th>Wilgotność (%)</th>    {/* NOWA KOLUMNA: relative_humidity */}
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