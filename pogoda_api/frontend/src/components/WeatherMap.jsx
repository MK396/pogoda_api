// frontend/src/components/WeatherMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// NOWY IMPORT
import { Link } from 'react-router-dom';

const WeatherMap = ({ data }) => {
    // Domyślne współrzędne środka Polski (Warszawa)
    const defaultCenter = [52.2297, 21.0122];

    return (
        <div id="map-container">
            <MapContainer
                center={defaultCenter}
                zoom={6}
                style={{ height: '500px', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />

                {data.map((city) => (
                    <Marker
                        key={city.city_name}
                        position={[city.latitude, city.longitude]}
                    >
                        <Popup>
                            <div style={{ textAlign: 'center' }}>
                                <h3>{city.city_name}</h3>
                                <p>Temperatura: <strong>{city.temperature.toFixed(1)}°C</strong></p>
                                {/* Pamiętamy o dodanych wcześniej polach */}
                                <p>Wilgotność: {city.relative_humidity.toFixed(0)}%</p>
                                <p>Wiatr: {city.wind_speed.toFixed(1)} m/s</p>

                                <hr style={{ margin: '8px 0' }} />

                                {/* NOWY ODNOŚNIK */}
                                {/* Używamy encodeURIComponent, aby nazwy miast ze spacjami były poprawne w URL */}
                                <Link
                                    to={`/pogoda/${encodeURIComponent(city.city_name)}`}
                                    style={{ color: '#007bff', fontWeight: 'bold', textDecoration: 'none' }}
                                >
                                    Zobacz szczegóły &rarr;
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default WeatherMap;