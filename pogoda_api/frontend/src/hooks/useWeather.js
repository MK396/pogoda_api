import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, ENDPOINTS } from '../api/config';

const fetchData = async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (response.status === 404) return null;
    if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
    }
    return response.json();
};

export const useCurrentWeather = (refreshInterval = 300000) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWeather = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchData(ENDPOINTS.CURRENT);
            setData(result || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWeather();
        if (refreshInterval) {
            const interval = setInterval(fetchWeather, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchWeather, refreshInterval]);

    return { data, loading, error, refetch: fetchWeather };
};

export const useCityHistory = (city) => {
    const [historyData, setHistoryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!city) return;

        const loadHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await fetchData(ENDPOINTS.HISTORY(city));
                // Jeśli 404 (null), ustawiamy pustą historię, zamiast błędu
                setHistoryData(result || { city_name: city, history: [] });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [city]);

    return { historyData, loading, error };
};
export const useCityForecast = (city) => {
    // 1. Zmieniamy stan początkowy na obiekt, a nie null/tablicę
    const [forecastData, setForecastData] = useState({ hourly: [], recommendation: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchForecast = useCallback(async (selectedCity) => {
        if (!selectedCity) return;
        setLoading(true);
        setError(null);
        try {
            const result = await fetchData(ENDPOINTS.FORECAST(selectedCity));

            // 2. KLUCZOWA ZMIANA: Zapisujemy cały wynik (JSON), a nie tylko result.hourly
            // Backend zwraca teraz: { hourly: [...], recommendation: "Tekst", city: "Nazwa" }
            setForecastData(result || { hourly: [], recommendation: null });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (city) fetchForecast(city);
    }, [city, fetchForecast]);

    return { forecastData, loading, error, refetch: () => fetchForecast(city) };
};

export const useRefreshedCityWeather = (city) => {
    const [latestReading, setLatestReading] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!city) return;

        const fetchSpecificCity = async () => {
            setLoading(true);
            setError(null);
            try {
                // Używamy endpointu REFRESH zgodnie z Twoim wymaganiem
                const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REFRESH}`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const allCitiesData = await response.json();

                // Znajdujemy miasto w pobranej liście
                const matchedCity = allCitiesData.find(item => item.city_name === city);
                setLatestReading(matchedCity || null);

            } catch (err) {
                console.error("Błąd pobierania aktualnych danych dla detali:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecificCity();
    }, [city]);

    return { latestReading, loading, error };
};