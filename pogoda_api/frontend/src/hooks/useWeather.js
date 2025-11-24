// src/hooks/useWeather.js
import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL, ENDPOINTS } from '../api/config';

// Generyczna funkcja fetchująca
const fetchData = async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (response.status === 404) return null;
    if (!response.ok) {
        throw new Error(`Błąd HTTP: ${response.status}`);
    }
    return response.json();
};

// --- POPRAWIONY HOOK ---
// Używamy endpointu REFRESH, aby przy wejściu na stronę główną
// wymusić pobranie danych z zewnętrznego API (OpenMeteo).
export const useCurrentWeather = (refreshInterval = 300000) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWeather = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // ZMIANA: ENDPOINTS.CURRENT -> ENDPOINTS.REFRESH
            // Dzięki temu dane są odświeżane przy każdym załadowaniu strony głównej
            const result = await fetchData(ENDPOINTS.REFRESH);
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
            // Automatyczne odświeżanie co X ms (domyślnie 5 min)
            const interval = setInterval(fetchWeather, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchWeather, refreshInterval]);

    return { data, loading, error, refetch: fetchWeather };
};

// --- POZOSTAŁE HOOKI (BEZ ZMIAN) ---

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
    // Pamiętaj o obsłudze recommendation (obiekt)
    const [forecastData, setForecastData] = useState({ hourly: [], recommendation: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchForecast = useCallback(async (selectedCity) => {
        if (!selectedCity) return;
        setLoading(true);
        setError(null);
        try {
            const result = await fetchData(ENDPOINTS.FORECAST(selectedCity));
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

// Hook do pobierania pojedynczego odświeżonego miasta (dla CityDetailPage)
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
                const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REFRESH}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const allCitiesData = await response.json();
                const matchedCity = allCitiesData.find(item => item.city_name === city);
                setLatestReading(matchedCity || null);
            } catch (err) {
                console.error("Błąd pobierania danych miasta:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecificCity();
    }, [city]);

    return { latestReading, loading, error };
};