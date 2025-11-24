import React, { memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';

// --- STAŁE KONFIGURACYJNE ---
const MAP_CONFIG = {
    DEFAULT_CENTER: [52.2297, 21.0122], // Warszawa
    DEFAULT_ZOOM: 6.4,
    TILE_URL: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    ATTRIBUTION: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
};

// --- KOMPONENTY POMOCNICZE ---

// Wydzielony komponent zawartości dymka - czyściej i łatwiej zarządzać stylami
const CityMarkerPopup = ({ city }) => {
    const { city_name, temperature, relative_humidity, wind_speed } = city;

    return (
        <div style={{ textAlign: 'center', minWidth: '140px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#333' }}>
                {city_name}
            </h3>

            <div style={{ fontSize: '0.95rem', lineHeight: '1.5', color: '#555' }}>
                <div>Temp: <strong>{temperature?.toFixed(1) ?? '-'}°C</strong></div>
                <div>Wilg: {relative_humidity?.toFixed(0) ?? '-'}%</div>
                <div>Wiatr: {wind_speed?.toFixed(1) ?? '-'} m/s</div>
            </div>

            <hr style={{ margin: '10px 0', border: '0', borderTop: '1px solid #eee' }} />

            <Link
                to={`/pogoda/${encodeURIComponent(city_name)}`}
                style={{
                    color: '#007bff',
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                }}
            >
                Zobacz szczegóły &rarr;
            </Link>
        </div>
    );
};

// --- GŁÓWNY KOMPONENT ---

const WeatherMap = ({ data }) => {
    return (
        // Dodano stylowanie kontenera, aby pasował do reszty UI (zaokrąglenia, cień)
        <div id="map-container" style={{
            height: '666px',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '3px solid #e0e0e0'
        }}>
            <MapContainer
                center={MAP_CONFIG.DEFAULT_CENTER}
                zoom={MAP_CONFIG.DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url={MAP_CONFIG.TILE_URL}
                    attribution={MAP_CONFIG.ATTRIBUTION}
                />

                {data.map((city) => (
                    <Marker
                        key={city.city_name}
                        position={[city.latitude, city.longitude]}
                    >
                        <Popup>
                            <CityMarkerPopup city={city} />
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

// Używamy memo, aby mapa nie przerysowywała się niepotrzebnie, jeśli dane się nie zmieniły
export default memo(WeatherMap);