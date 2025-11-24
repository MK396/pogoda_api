import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from 'recharts';
import { useCityHistory } from '../hooks/useWeather';

// --- KOMPONENTY POMOCNICZE ---

const CustomTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0];
        // label przy type="number" to liczba (timestamp), więc musimy sformatować
        const dateObj = new Date(label);
        const fullDate = dateObj.toLocaleString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        return (
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                padding: '10px',
                border: '1px solid #ccc',
                color: '#333',
                fontSize: '14px'
            }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{fullDate}</p>
                <p style={{ margin: 0 }}>
                    {dataPoint.name}: <strong>{dataPoint.value?.toFixed(1) ?? '-'} {unit}</strong>
                </p>
            </div>
        );
    }
    return null;
};

// Generyczny wykres z osią czasu
const HistoryChart = ({ data, dataKey, name, color, unit, ticks }) => (
    <div style={{
        width: '100%',
        height: 300,
        marginBottom: '40px',
    }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#444' }}>{name}</h3>
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />

                    {/* KLUCZOWA ZMIANA: type="number" i domain */}
                    <XAxis
                        dataKey="timestampNumber" // Używamy liczbowego timestampu
                        type="number"
                        domain={['dataMin', 'dataMax']} // Rozciągnij od pierwszego do ostatniego punktu
                        ticks={ticks} // Wymuszamy etykiety co konkretny odstęp czasu (np. codziennie)
                        tickFormatter={(unixTime) => new Date(unixTime).toLocaleDateString('pl-PL', {
                            day: '2-digit',
                            month: '2-digit'
                        })}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                    />

                    <YAxis
                        label={{ value: unit, angle: -90, position: 'insideLeft' }}
                        tick={{ fontSize: 12 }}
                        domain={['auto', 'auto']}
                    />

                    <Tooltip content={<CustomTooltip unit={unit} />} />
                    <Legend verticalAlign="top" height={36} />

                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        name={name}
                        stroke={color}
                        dot={false} // Ukrywamy kropki, bo przy dużej ilości danych zlewają się
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                        connectNulls
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
);

// --- GŁÓWNY KOMPONENT ---

const CityHistory = ({ currentCity }) => {
    const { historyData, loading, error } = useCityHistory(currentCity);

    // Przetwarzanie danych
    const { chartData, ticks } = useMemo(() => {
        if (!historyData || !historyData.history || historyData.history.length === 0) {
            return { chartData: [], ticks: [] };
        }

        // 1. Sortowanie
        const sortedHistory = [...historyData.history].sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        // 2. Mapowanie na format z timestampem liczbowym
        const data = sortedHistory.map((record) => ({
            ...record,
            timestampNumber: new Date(record.timestamp).getTime(), // Zamiana na liczbę (ms)
        }));

        // 3. Generowanie Ticków (Etykiet Osi X)
        // Chcemy etykietę np. co 24h lub co 48h, żeby nie było tłoku, ale żeby zachować skalę.
        if (data.length === 0) return { chartData: [], ticks: [] };

        const minTime = data[0].timestampNumber;
        const maxTime = data[data.length - 1].timestampNumber;
        const oneDay = 24 * 60 * 60 * 1000;

        const generatedTicks = [];
        // Zaczynamy od początku zakresu i dodajemy co 1-2 dni w zależności od długości historii
        // Jeśli zakres > 15 dni, wyświetlaj co 2 dni, jeśli mniej, co 1 dzień
        const step = (maxTime - minTime) > (15 * oneDay) ? 2 * oneDay : oneDay;

        let currentTick = minTime;
        while (currentTick <= maxTime) {
            generatedTicks.push(currentTick);
            currentTick += step;
        }

        return { chartData: data, ticks: generatedTicks };
    }, [historyData]);


    if (loading) return <div id="city-history" style={{ marginTop: '30px' }}><p>Ładowanie historii...</p></div>;
    if (error) return <div id="city-history" style={{ marginTop: '30px', color: 'red' }}><p>Błąd: {error}</p></div>;
    if (chartData.length === 0) return <div id="city-history" style={{ marginTop: '30px' }}><p>Brak danych historycznych.</p></div>;

    return (
        <div id="city-history" style={{
            marginTop: '30px',
            width: '100%',
            padding: '0 20px',
            boxSizing: 'border-box'
        }}>
            <HistoryChart
                data={chartData}
                ticks={ticks}
                dataKey="temperature"
                name="Temperatura Historyczna"
                color="#d32f2f"
                unit="°C"
            />

            <HistoryChart
                data={chartData}
                ticks={ticks}
                dataKey="precipitation"
                name="Opady"
                color="#1976d2"
                unit="mm"
            />

            <HistoryChart
                data={chartData}
                ticks={ticks}
                dataKey="wind_speed"
                name="Prędkość Wiatru"
                color="#388e3c"
                unit="m/s"
            />

            <HistoryChart
                data={chartData}
                ticks={ticks}
                dataKey="relative_humidity"
                name="Wilgotność"
                color="#fbc02d"
                unit="%"
            />
        </div>
    );
};

export default CityHistory;