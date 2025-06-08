// RouteGraph.jsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const truckIcon = new L.Icon({
  iconUrl: '/truck.png', // place this in public/
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

export default function RouteGraph({ polylineCoords }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!mapRef.current) {
      const leafletMap = L.map(mapRef.current).setView([12.97, 77.59], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(leafletMap);
      setMap(leafletMap);
    }
  }, []);

  useEffect(() => {
    if (map && polylineCoords.length > 0) {
      const latlngs = polylineCoords.map(p => [p[1], p[0]]);
      const routeLine = L.polyline(latlngs, { color: 'blue' }).addTo(map);
      map.fitBounds(routeLine.getBounds());

      const marker = L.marker(latlngs[0], { icon: truckIcon }).addTo(map);
      markerRef.current = marker;

      let i = 0;
      const animate = () => {
        if (i >= latlngs.length) return;
        marker.setLatLng(latlngs[i]);
        i++;
        setTimeout(animate, 100); // smooth delay
      };
      animate();

      return () => {
        map.removeLayer(routeLine);
        map.removeLayer(marker);
      };
    }
  }, [map, polylineCoords]);

  return <div ref={mapRef} style={{ height: '500px', width: '100%' }}></div>;
}
