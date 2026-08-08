'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store, Navigation, Phone, ExternalLink, ShieldCheck } from 'lucide-react';
import evMapData from '@/data/evMapData.json';
import { EvMapFilters, LayerFilter, StatusFilter } from './EvMapFilters';
import { EvMapLegend } from './EvMapLegend';

// Helper component to center map on user location
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 });
  }, [center, map]);
  return null;
}

// Custom DivIcons for Leaflet (Avoids default Leaflet image path asset errors)
const createChargerIcon = (status: string) => {
  const colorClass =
    status === 'working'
      ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-500/30'
      : status === 'busy'
      ? 'bg-amber-500 border-amber-300 text-slate-950 ring-2 ring-amber-500/30'
      : 'bg-rose-600 border-rose-400 text-white ring-2 ring-rose-500/30';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="w-8 h-8 rounded-2xl ${colorClass} border-2 flex items-center justify-center shadow-lg transform hover:scale-115 transition-transform">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const createDealerIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="w-8 h-8 rounded-2xl bg-blue-600 border-2 border-blue-400 text-white flex items-center justify-center shadow-lg ring-2 ring-blue-500/30 transform hover:scale-115 transition-transform">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"></path>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"></path>
        <path d="M2 7h20"></path>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="relative w-8 h-8 flex items-center justify-center">
      <div class="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-75"></div>
      <div class="relative w-7 h-7 rounded-full bg-teal-500 border-2 border-white text-slate-950 flex items-center justify-center shadow-xl font-bold">
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

export function EvMapContainer() {
  const [layerFilter, setLayerFilter] = useState<LayerFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Delhi NCR Map Bounds & Center Constraints
  const delhiCenter: [number, number] = [28.6139, 77.2090];
  const maxBounds: [[number, number], [number, number]] = [
    [28.15, 76.75],
    [29.15, 77.65],
  ];

  // Request User Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          // Check if user is within NCR bounds before placing user pin
          if (
            coords[0] >= 28.0 &&
            coords[0] <= 29.3 &&
            coords[1] >= 76.5 &&
            coords[1] <= 77.8
          ) {
            setUserLocation(coords);
          }
        },
        () => {
          // Geolocation permission denied or unavailable
        }
      );
    }
  }, []);

  // Filter Data
  const filteredChargers = evMapData.chargingStations.filter((s) => {
    if (layerFilter === 'dealers') return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    return true;
  });

  const filteredDealers = evMapData.dealerships.filter(() => {
    if (layerFilter === 'chargers') return false;
    return true;
  });

  const handleResetFilters = () => {
    setLayerFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="w-full h-full min-h-[580px] sm:min-h-[660px] flex flex-col gap-4 text-slate-100 font-sans">
      {/* Top Filter Bar */}
      <EvMapFilters
        layer={layerFilter}
        setLayer={setLayerFilter}
        status={statusFilter}
        setStatus={setStatusFilter}
        onReset={handleResetFilters}
      />

      {/* Main Map Canvas Box */}
      <div className="relative flex-1 w-full min-h-[500px] sm:min-h-[580px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        <MapContainer
          center={delhiCenter}
          zoom={11}
          minZoom={10}
          maxZoom={17}
          maxBounds={maxBounds}
          maxBoundsViscosity={1.0}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%', minHeight: '500px', background: '#020617' }}
          className="z-0"
        >
          {/* CartoDB Dark Matter Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />

          {/* User Location Center Effect */}
          {userLocation && <RecenterMap center={userLocation} />}

          {/* User Location Pin & Accuracy Circle */}
          {userLocation && (
            <>
              <Marker position={userLocation} icon={createUserIcon()}>
                <Popup className="dark-map-popup">
                  <div className="p-3 bg-slate-950 border border-teal-500/40 rounded-2xl text-slate-100 text-xs space-y-1">
                    <div className="font-extrabold text-teal-400 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 fill-teal-400" />
                      <span>Your GPS Location</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Delhi NCR Region</p>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={userLocation}
                radius={800}
                pathOptions={{ fillColor: '#14b8a6', fillOpacity: 0.15, color: '#14b8a6', weight: 1.5 }}
              />
            </>
          )}

          {/* Charging Station Markers */}
          {filteredChargers.map((stn) => (
            <Marker
              key={stn.id}
              position={[stn.lat, stn.lng]}
              icon={createChargerIcon(stn.status)}
            >
              <Popup className="dark-map-popup">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-xs space-y-3 min-w-[240px] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                      {stn.operator}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        stn.status === 'working'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : stn.status === 'busy'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {stn.status.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-white leading-snug">{stn.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{stn.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold">POWER OUTPUT</span>
                      <span className="font-extrabold text-emerald-400 text-xs">{stn.powerKw} kW Fast DC</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] font-bold">AVAILABILITY</span>
                      <span className="font-bold text-white">
                        {stn.availableGuns}/{stn.totalGuns} Guns Free
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-400">Rate: <span className="font-bold text-white">₹{stn.costPerKwh}/kWh</span></span>
                    <span className="text-slate-500 text-[9px]">Verified {stn.lastVerified}</span>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${stn.lat},${stn.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-[11px] transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>Navigate to Charger</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Dealership Markers */}
          {filteredDealers.map((dlr) => (
            <Marker
              key={dlr.id}
              position={[dlr.lat, dlr.lng]}
              icon={createDealerIcon()}
            >
              <Popup className="dark-map-popup">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-100 text-xs space-y-3 min-w-[250px] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      {dlr.brand}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Empanelled
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-white leading-snug">{dlr.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{dlr.address}</p>
                  </div>

                  {dlr.exclusiveOffer && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                      🎁 {dlr.exclusiveOffer}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Rating: <span className="font-bold text-amber-400">★ {dlr.rating}</span> ({dlr.reviewCount})</span>
                    <span className="text-emerald-400 font-bold">Delhi Subsidies Honored</span>
                  </div>

                  <a
                    href={`tel:${dlr.phone}`}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[11px] transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Showroom ({dlr.phone})</span>
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Interactive Map Legend (Bottom Right Overlay) */}
        <div className="absolute bottom-6 right-6 z-10 hidden sm:block max-w-xs">
          <EvMapLegend />
        </div>
      </div>
    </div>
  );
}
