'use client';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function JabarMap({ points, onSelect }: { points: any[], onSelect: (region: any) => void }) {
  const getStatusColor = (status: string) => {
    if (status === 'RED') return '#ef4444';
    if (status === 'YELLOW') return '#f59e0b';
    return '#3b82f6'; // Green kita tampilkan biru agar 'elite'
  };

  return (
    <MapContainer center={[-6.9175, 107.6244]} zoom={9} className="h-full w-full">
      <TileLayer 
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />
      {points.map((p, idx) => (
        <CircleMarker
          key={idx}
          center={[p.latitude, p.longitude]}
          radius={12}
          pathOptions={{ 
            fillColor: getStatusColor(p.inflation_status), 
            color: 'white', 
            weight: 2, 
            fillOpacity: 0.8 
          }}
          eventHandlers={{ click: () => onSelect(p) }}
        >
          <Popup>
            <div className="text-gray-900 font-bold">{p.kab_kota}</div>
            <div className="text-xs text-gray-600">Status: {p.inflation_status}</div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}