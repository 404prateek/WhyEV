'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';
import { StationData } from './PreviewPanel';
import { StationStatusType } from './StatusBadge';

interface MapCanvasContainerProps {
  stations: StationData[];
  selectedStationId: string | null;
  onStationSelect: (stn: StationData) => void;
  userLocation: [number, number] | null;
  onLocateMe: () => void;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 });
  }, [center, map]);
  return null;
}

// 4-State Custom Color Status DivIcons
const createStationIcon = (status: StationStatusType, isSelected: boolean) => {
  const statusConfig = {
    working: 'bg-emerald-600 border-emerald-400 text-white ring-4 ring-emerald-500/30',
    busy: 'bg-amber-500 border-amber-300 text-slate-950 ring-4 ring-amber-500/30',
    broken: 'bg-rose-600 border-rose-400 text-white ring-4 ring-rose-500/30',
    unverified: 'bg-slate-500 border-slate-300 text-slate-950 ring-2 ring-slate-500/20',
  }[status];

  const scaleClass = isSelected ? 'scale-125 z-50 ring-8 ring-emerald-500/40' : 'hover:scale-115';

  return L.divIcon({
    className: 'custom-leaflet-station-marker',
    html: `<div class="w-8 h-8 rounded-full ${statusConfig} border-2 flex items-center justify-center shadow-xl transition-transform ${scaleClass}">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-location-marker',
    html: `<div class="relative w-8 h-8 flex items-center justify-center">
      <div class="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
      <div class="relative w-7 h-7 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-xl font-bold">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
        </svg>
      </div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export function MapCanvasContainer({
  stations,
  selectedStationId,
  onStationSelect,
  userLocation,
  onLocateMe,
}: MapCanvasContainerProps) {
  const delhiCenter: [number, number] = [28.6139, 77.2090];
  const maxBounds: [[number, number], [number, number]] = [
    [28.15, 76.75],
    [29.15, 77.65],
  ];

  return (
    <div className="relative w-full h-full min-h-[550px] sm:min-h-[640px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg bg-slate-50">
      <MapContainer
        center={delhiCenter}
        zoom={11}
        minZoom={10}
        maxZoom={17}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '550px', background: '#f8fafc' }}
        className="z-0"
      >
        {/* CartoDB Voyager Clean Light Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {/* User Location Recenter */}
        {userLocation && <RecenterMap center={userLocation} />}

        {/* User Location Pin */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={createUserIcon()}>
              <Popup>
                <div className="p-2 bg-white text-emerald-800 font-extrabold text-xs">
                  Your Current GPS Position
                </div>
              </Popup>
            </Marker>
            <Circle
              center={userLocation}
              radius={800}
              pathOptions={{ fillColor: '#059669', fillOpacity: 0.15, color: '#059669', weight: 1.5 }}
            />
          </>
        )}

        {/* Marker Clustering Group */}
        <MarkerClusterGroup
          chunkedLoading
          showCoverageOnHover={false}
          maxClusterRadius={40}
        >
          {stations.map((stn) => (
            <Marker
              key={stn.id}
              position={[stn.lat, stn.lng]}
              icon={createStationIcon(stn.status, stn.id === selectedStationId)}
              eventHandlers={{
                click: () => onStationSelect(stn),
              }}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Floating "Locate Me" Action Button */}
      <button
        onClick={onLocateMe}
        className="absolute bottom-6 left-6 z-10 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 hover:text-emerald-700 hover:bg-slate-50 transition-all shadow-lg cursor-pointer flex items-center gap-2 text-xs font-extrabold"
        title="Locate My Position"
      >
        <Navigation className="w-4 h-4 fill-emerald-600 text-emerald-600" />
        <span className="hidden sm:inline">Locate Me</span>
      </button>
    </div>
  );
}
