'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Zap, Star, ArrowRight } from 'lucide-react';
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

const createStationIcon = (status: StationStatusType, isSelected: boolean) => {
  const isWorking = status === 'working';
  const isBroken = status === 'broken';

  // Yellow / Amber for unverified, unknown, or busy
  let colorClasses = 'bg-amber-400 border-yellow-200 text-slate-950 shadow-[0_0_16px_rgba(245,158,11,0.85)] ring-4 ring-amber-400/40';
  let pulseClass = 'bg-amber-400/40';

  if (isWorking) {
    // Green glow for verified working
    colorClasses = 'bg-emerald-600 border-emerald-300 text-white shadow-[0_0_16px_rgba(16,185,129,0.85)] ring-4 ring-emerald-500/40';
    pulseClass = 'bg-emerald-400/40';
  } else if (isBroken) {
    // Red glow for reported broken
    colorClasses = 'bg-rose-600 border-rose-300 text-white shadow-[0_0_16px_rgba(244,63,94,0.9)] ring-4 ring-rose-500/50';
    pulseClass = 'bg-rose-500/50';
  }

  const scaleClass = isSelected ? 'scale-135 z-50 ring-8 ring-emerald-400' : 'hover:scale-120';

  return L.divIcon({
    className: 'custom-leaflet-station-marker',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute inset-0 rounded-full ${pulseClass} animate-ping opacity-75"></div>
        <div class="relative w-8 h-8 rounded-full ${colorClasses} border-2 flex items-center justify-center shadow-2xl transition-transform ${scaleClass}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />

        {userLocation && <RecenterMap center={userLocation} />}

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

        <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} maxClusterRadius={40}>
          {stations.map((stn) => {
            const availableCount = stn.connectors.reduce((acc, c) => acc + c.available, 0);
            const totalCount = stn.connectors.reduce((acc, c) => acc + c.total, 0);
            const connTypes = Array.from(new Set(stn.connectors.map((c) => c.type))).join(', ');
            const speedKw = stn.maxPowerKw;

            return (
              <Marker
                key={stn.id}
                position={[stn.lat, stn.lng]}
                icon={createStationIcon(stn.status, stn.id === selectedStationId)}
              >
                {/* Compact Floating Preview Card beside/above pin */}
                <Popup className="custom-station-popup">
                  <div className="p-3 w-56 space-y-2 text-slate-900 font-sans">
                    <div>
                      <div className="text-[10px] font-black uppercase text-emerald-700">{stn.operator}</div>
                      <h4 className="text-xs font-black text-slate-900 leading-snug truncate">{stn.name}</h4>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{stn.address}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold border-t border-b border-slate-100 py-1.5">
                      <div>
                        <span className="text-slate-400 block">Availability</span>
                        <span className="text-emerald-700 font-black">{availableCount}/{totalCount} Free</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Speed</span>
                        <span className="text-slate-800">{speedKw} kW Fast</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center gap-1 text-[10px] font-extrabold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>4.8</span>
                      </div>
                      <button
                        onClick={() => onStationSelect(stn)}
                        className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
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
