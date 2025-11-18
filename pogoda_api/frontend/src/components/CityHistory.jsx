// frontend/src/components/CityHistory.jsx
import React from 'react';

const CityHistory = ({ historyData }) => {
    // Sprawdzamy, czy dane są dostępne i czy istnieje lista historii
    if (!historyData || !historyData.history || historyData.history.length === 0) {
        return (
            <div id="city-history" style={{marginTop: '30px'}}>
                <h2>Historia pogody dla {historyData?.city_name || 'Wybranego Miasta'}</h2>
                <p>Brak danych historycznych do wyświetlenia.</p>
            </div>
        );
    }

    const { city_name, history } = historyData;

    return (
        <div id="city-history" style={{marginTop: '30px'}}>
            <h2>Historia pogody dla {city_name}</h2>
            <table border="1" cellPadding="5" cellSpacing="0">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Temperatura (°C)</th>
                        {/* Możesz dodać tu więcej pól, jeśli używasz np. precipitation */}
                    </tr>
                </thead>
                <tbody>
                    {history.map((record, index) => (
                        <tr key={record.timestamp || index}>
                            {/* Wyświetlanie daty i czasu */}
                            <td>{new Date(record.timestamp).toLocaleString()}</td>
                            {/* Formatowanie temperatury do jednego miejsca po przecinku */}
                            <td>{record.temperature.toFixed(1)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CityHistory;