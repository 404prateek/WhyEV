'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store, Navigation, Phone, ExternalLink, ShieldCheck, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import evMapData from '@/data/evMapData.json';
import { EvMapFilters, LayerFilter, StatusFilter } from './EvMapFilters';
import { EvMapLegend } from './EvMapLegend';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ChargingStationData {
  id: string;
  name: string;
  operator: string;
  address: string;
  lat: number;
  lng: number;
  status: string;
  powerKw: number;
  totalGuns: number;
  availableGuns: number;
  costPerKwh: number;
  lastVerified: string;
}

// Helper component to center map on user location
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 });
  }, [center, map]);
  return null;
}

// Custom DivIcons for Leaflet
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

  const [chargers, setChargers] = useState<ChargingStationData[]>([]);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Delhi NCR Map Bounds & Center Constraints
  const delhiCenter: [number, number] = [28.6139, 77.2090];
  const maxBounds: [[number, number], [number, number]] = [
    [28.15, 76.75],
    [29.15, 77.65],
  ];

  const fetchChargers = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${API_BASE}/chargers`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Unreachable chargers API`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setChargers(data);
        setIsUsingFallback(false);
      } else {
        throw new Error('API returned empty chargers list');
      }
    } catch (e: any) {
      console.warn('[EvMapContainer] Backend chargers API fetch failed. Using evMapData.json fallback:', e);
      setChargers(evMapData.chargingStations as any);
      setIsUsingFallback(true);
      setApiError(`Could not reach backend chargers API at ${API_BASE}/chargers. Showing cached demo data.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChargers();
  }, [fetchChargers]);

  // Request User Location on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          if (
            coords[0] >= 28.0 &&
            coords[0] <= 29.3 &&
            coords[1] >= 76.5 &&
            coords[1] <= 77.8
          ) {
            setUserLocation(coords);
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []);

  const filteredChargers = chargers.filter((s) => {
    if (layerFilter === 'dealers') return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
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
        
        {/* Visible "Showing Cached / Demo Data" Indicator Banner (Item 1 Requirement) */}
        {isUsingFallback && (
          <div className="absolute top-4 left-4 right-4 sm:right-auto z-[1000] max-w-md p-3 rounded-2xl bg-amber-500/90 backdrop-blur-md border border-amber-300 text-slate-950 shadow-xl flex items-center justify-between gap-3 text-xs font-extrabold animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-slate-950" />
              <span>Showing cached / demo data (Backend connection offline)</span>
            </div>
            <button
              onClick={fetchChargers}
              className="px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-bold text-[10px] transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              title="Retry API connection"
            >
              <RefreshCw className="w-3 h-3 text-amber-400" />
              <span>Retry</span>
            </button>
          </div>
        )}

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

        </MapContainer>

        {/* Floating Interactive Map Legend (Bottom Right Overlay) */}
        <div className="absolute top-4 right-4 z-10 hidden sm:block max-w-xs">
          <EvMapLegend />
        </div>

        {/* Dealer Lead Generation Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 p-6 rounded-3xl shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Delhi Public Charging Network</h3>
            <p className="text-sm text-slate-300 font-medium">
              Over 4,500+ operational charging points across Delhi NCR under the Delhi EV Policy 2026.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
