'use client';
// 1. TAMBAHKAN 'Marker' di import react-leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet'; 

export default function JabarMap({ points, onSelect }: { points: any[], onSelect: (region: any) => void }) {
  
  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toUpperCase()?.trim();
    if (normalizedStatus === 'RED') return '#ef4444';
    if (normalizedStatus === 'YELLOW') return '#FBBF24'; 
    return '#3b82f6'; 
  };

  const createWaverIcon = (statusColor: string) => {
    const svgString = ReactDOMServer.renderToString(
      <svg width="60" height="60" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="8" fill={statusColor} />
        <circle cx="30" cy="30" r="8" stroke={statusColor} strokeWidth="1.5" fill="none">
          <animate attributeName="r" from="8" to="28" dur="1.8s" begin="0s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" from="0.7" to="0" dur="1.8s" begin="0s" repeatCount="indefinite" />
        </circle>
        <circle cx="30" cy="30" r="8" stroke={statusColor} strokeWidth="1" fill="none">
          <animate attributeName="r" from="8" to="26" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" from="0.5" to="0" dur="1.8s" begin="0.6s" repeatCount="indefinite" />
        </circle>
      </svg>
    );

    return L.divIcon({
      html: svgString,
      // Berikan class kosong atau bg-transparent agar Leaflet tidak memberikan background putih default
      className: 'bg-transparent border-none outline-none', 
      iconSize: [60, 60], 
      iconAnchor: [30, 30], 
    });
  };

  return (
    <MapContainer center={[-6.9175, 107.6244]} zoom={9} className="h-full w-full">
      <TileLayer 
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />
      {points.map((p, idx) => {
        const pointColor = getStatusColor(p.inflation_status);

        // 2. PERBAIKAN: Gunakan <Marker> dari react-leaflet, bukan <L.Marker>
        return (
          <Marker
            key={idx}
            position={[p.latitude, p.longitude]}
            icon={createWaverIcon(pointColor)}
            eventHandlers={{ click: () => onSelect(p) }}
          >
            <Popup>
              <div className="text-gray-900 font-bold">{p.kab_kota}</div>
              <div className="text-xs text-gray-600">Status: {p.inflation_status}</div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}