// frontend/src/components/WeatherMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Naprawa ikon Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const WeatherMap = ({ data }) => {
    const position = [52.0, 19.0];
    const zoom = 6;

    return (
        <div id="map">
            <MapContainer
                center={position}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                />

                {data.map(item => (
                    <Marker
                        key={item.city_name}
                        position={[item.latitude, item.longitude]}
                        // ❌ USUNIĘTE kliknięcie markera
                    >
                        <Popup>
                            <b>{item.city_name}</b><br/>
                            Temp: {item.temperature.toFixed(1)} °C
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default WeatherMap;
