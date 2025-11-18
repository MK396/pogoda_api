// frontend/src/components/WeatherMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';


// Ważne: Naprawa domyślnych ikon Leaflet, które psują się w React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const WeatherMap = ({ data, onMarkerClick }) => {
    // Domyślne położenie Polski i poziom zoomu
    const position = [52.0, 19.0];
    const zoom = 6;

    // MapContainer musi mieć ustaloną wysokość, nadaną przez CSS (użyliśmy #map {height: 500px})
    return (
        <div id="map">
            <MapContainer
                center={position}
                zoom={zoom}
                scrollWheelZoom={true}
                // Musi mieć styl inline, aby dziedziczyć 100% z div#map
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />

                {data.map(item => (
                    <Marker
                        key={item.city_name}
                        // Pozycja znacznika
                        position={[item.latitude, item.longitude]}
                        // Obsługa kliknięcia znacznika
                        eventHandlers={{
                            click: () => onMarkerClick(item.city_name),
                        }}
                    >
                        <Popup>
                            <b>{item.city_name}</b><br/>Temp: {item.temperature.toFixed(1)} °C
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default WeatherMap;