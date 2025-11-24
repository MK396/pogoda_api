// frontend/src/App.jsx
import React from 'react';
// IMPORTUJEMY NARZĘDZIA DO ROUTINGU
import { Routes, Route } from 'react-router-dom';

// Importujemy nowe komponenty stron
import HomePage from './pages/HomePage.jsx';
import CityDetailPage from './pages/CityDetailPage.jsx';

function App() {
    // USUNIĘTO WSZYSTKIE STANY (useState, useEffect, handleCityClick, handleBackToHome)

    return (
        <div className="app-container">
            {/* Definicja ścieżek */}
            <Routes>
                {/* Strona główna: / */}
                <Route path="/" element={<HomePage />} />

                {/* Strona szczegółów miasta: /pogoda/NAZWA_MIASTA */}
                <Route path="/pogoda/:city" element={<CityDetailPage />} />

                {/* Opcjonalnie: strona 404 */}
                <Route path="*" element={<h1>404 | Strona nie została znaleziona</h1>} />
            </Routes>
        </div>
    );
}

export default App;