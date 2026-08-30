import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Hospital } from '../types';
import { Building2, Navigation, Phone, CheckCircle, ExternalLink, MapPinOff } from 'lucide-react';

// Custom Map Pins for Leaflet
const createCustomIcon = (isGov: boolean, isSelected: boolean) => {
  const bgColor = isSelected ? '#ea580c' : isGov ? '#0284c7' : '#9333ea';
  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
      ">
        <div style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;">🏥</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const userLocationIcon = L.divIcon({
  className: 'user-leaflet-pin',
  html: `
    <div style="
      background-color: #10b981;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.3);
      animation: pulse 2s infinite;
    "></div>
  `,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

interface MapViewProps {
  hospitals: Hospital[];
  centerLat: number;
  centerLng: number;
  selectedHospitalId?: number | null;
  onSelectHospital?: (id: number) => void;
  userLat?: number | null;
  userLng?: number | null;
}

export const MapView: React.FC<MapViewProps> = ({
  hospitals,
  centerLat,
  centerLng,
  selectedHospitalId,
  onSelectHospital,
  userLat,
  userLng,
}) => {
  const center: [number, number] = [centerLat || 19.7515, centerLng || 75.7139]; // Default Maharashtra center

  // Filter hospitals that actually possess coordinates
  const hospitalsWithCoords = hospitals.filter(
    (h) => h.latitude !== null && h.latitude !== undefined &&
           h.longitude !== null && h.longitude !== undefined &&
           !isNaN(h.latitude) && !isNaN(h.longitude)
  );

  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative">
      <MapContainer center={center} zoom={8} scrollWheelZoom={true} className="w-full h-full">
        <ChangeView center={center} zoom={8} />
        
        {/* OpenStreetMap standard tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker & Radius Circle */}
        {userLat && userLng && (
          <>
            <Marker position={[userLat, userLng]} icon={userLocationIcon}>
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <strong className="text-emerald-700 block">📍 Your Location</strong>
                  <span className="text-slate-500">Searching hospitals in radius</span>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[userLat, userLng]}
              radius={10000}
              pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.08, weight: 1.5, dashArray: '4, 4' }}
            />
          </>
        )}

        {/* Hospital Markers (Only for genuine coordinates) */}
        {hospitalsWithCoords.map((hosp) => {
          const isSelected = selectedHospitalId === hosp.id;
          return (
            <Marker
              key={hosp.id}
              position={[hosp.latitude!, hosp.longitude!]}
              icon={createCustomIcon(hosp.is_government || false, isSelected)}
              eventHandlers={{
                click: () => {
                  if (onSelectHospital) onSelectHospital(hosp.id);
                },
              }}
            >
              <Popup>
                <div className="p-2 font-sans max-w-[260px] text-xs">
                  <div className="flex items-center gap-1 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      hosp.is_government ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {hosp.hospital_type}
                    </span>
                    {hosp.distance_km !== undefined && hosp.distance_km !== null && (
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {hosp.distance_km} km
                      </span>
                    )}
                  </div>

                  <strong className="text-slate-900 font-bold text-sm block mb-1">
                    {hosp.name}
                  </strong>

                  <p className="text-[11px] text-slate-500 mb-2 leading-tight">
                    {hosp.address || `${hosp.district_name}, Maharashtra`}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hosp.latitude},${hosp.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] text-center"
                    >
                      <Navigation className="w-3 h-3" />
                      Get Directions
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Notice when hospitals lack coordinates */}
      {hospitalsWithCoords.length === 0 && hospitals.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-slate-900/90 text-white p-3.5 rounded-xl backdrop-blur-xs border border-slate-700 shadow-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <MapPinOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>{hospitals.length} hospitals found</strong> in selected district. Coordinates are not provided in the source dataset — browse the full directory in <strong>List View</strong>.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
