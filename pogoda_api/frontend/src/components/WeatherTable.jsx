// frontend/src/components/WeatherTable.jsx
import React from 'react';



const WeatherTable = ({ data, onCityClick }) => {
    return (
        <table id="weather-table">
            <thead>
                <tr>
                    <th>Miasto</th>
                    <th>Temperatura (°C)</th>
                    <th>Szerokość</th>
                    <th>Długość</th>
                    <th>Ostatnia Aktualizacja</th>
                </tr>
            </thead>
            <tbody>
                {data.length === 0 ? (
                    <tr><td colSpan="5">Ładowanie danych lub brak danych...</td></tr>
                ) : (
                    data.map(item => (
                        <tr key={item.city_name}>
                            <td
                                className="city-name"
                                onClick={() => onCityClick(item.city_name)}
                                title={`Kliknij, aby zobaczyć historię dla ${item.city_name}`}
                            >
                                {item.city_name}
                            </td>
                            <td>{item.temperature.toFixed(1)}</td>
                            <td>{item.latitude}</td>
                            <td>{item.longitude}</td>
                            <td>{new Date(item.last_updated).toLocaleString()}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default WeatherTable;