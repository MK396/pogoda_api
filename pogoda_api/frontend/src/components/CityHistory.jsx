// frontend/src/components/CityHistory.jsx
import React from 'react';

const CityHistory = ({ historyData, cities = [], onCityChange }) => {

    const handleCitySelect = (e) => {
        if (onCityChange) {
            onCityChange(e.target.value); // przekazujemy nazwę miasta do rodzica
        }
    };

    // Brak danych lub pusta historia
    if (!historyData || !historyData.history || historyData.history.length === 0) {
        return (
            <div id="city-history" style={{ marginTop: '30px' }}>
                <h2>Historia pogody</h2>

                {/* 🔽 Rozwijana lista miast */}
                <div style={{ marginBottom: '15px' }}>
                    <label>Wybierz miasto: </label>
                    <select onChange={handleCitySelect} defaultValue="">
                        <option value="" disabled>-- wybierz --</option>
                        {cities.map((city, index) => (
                            <option key={index} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                <p>Brak danych historycznych do wyświetlenia.</p>
            </div>
        );
    }

    const { city_name, history } = historyData;

    return (
        <div id="city-history" style={{ marginTop: '30px' }}>
            <h2>Historia pogody dla {city_name}</h2>

            {/* 🔽 Rozwijana lista miast */}
            <div style={{ marginBottom: '15px' }}>
                <label>Wybierz miasto: </label>
                <select onChange={handleCitySelect} value={city_name}>
                    {cities.map((city, index) => (
                        <option key={index} value={city}>{city}</option>
                    ))}
                </select>
            </div>

            <table border="1" cellPadding="5" cellSpacing="0">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Temperatura (°C)</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((record, index) => (
                        <tr key={record.timestamp || index}>
                            <td>{new Date(record.timestamp).toLocaleString()}</td>
                            <td>{record.temperature.toFixed(1)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CityHistory;
