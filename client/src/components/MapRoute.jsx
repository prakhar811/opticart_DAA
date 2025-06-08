import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom truck icon
const truckIcon = new L.Icon({
  iconUrl: '/truck.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Auto-fit bounds when points update
function AutoZoom({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map(p => [p.y, p.x]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [points, map]);
  return null;
}

export default function MapRoute({ points, roadPolyline }) {
  const center = points.length > 0 ? [points[0].y, points[0].x] : [12.9716, 77.5946]; // Bangalore fallback
  const truckRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (roadPolyline.length === 0) return;
    if (!truckRef.current) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < roadPolyline.length) {
        truckRef.current.setLatLng(roadPolyline[i]);
        i += 1;
      } else {
        clearInterval(interval);
      }
    }, 10); // speed (lower is faster)

    return () => clearInterval(interval);
  }, [roadPolyline]);

  return (
    <div style={{ height: '700px', width: '100%', marginBottom: '20px' }}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((p, idx) => (
          <Marker key={idx} position={[p.y, p.x]}>
            <Popup>{p.name}</Popup>
          </Marker>
        ))}

        {roadPolyline.length > 0 && (
          <>
            <Polyline
              positions={roadPolyline}
              pathOptions={{ color: 'blue', weight: 4 }}
            />
            <Marker
              icon={truckIcon}
              position={roadPolyline[0]}
              ref={truckRef}
            />
          </>
        )}

        <AutoZoom points={points} />
      </MapContainer>
    </div>
  );
}
