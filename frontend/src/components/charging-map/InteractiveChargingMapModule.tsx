'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { StationData } from './PreviewPanel';
import { StationDetailPanel } from './StationDetailPanel';
import { CrowdsourcedReportModal } from './CrowdsourcedReportModal';
import { PassiveGeofenceBanner } from './PassiveGeofenceBanner';
import { LocationPermissionModal } from './LocationPermissionModal';
import { SearchBar } from './SearchBar';
import { FilterChipsBar, FilterState } from './FilterChipsBar';
import { StationStatusType } from './StatusBadge';
import { useCityStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { ChargingService } from '@/services/chargingService';
import { saveUserLocation } from '@/services/locationService';

// SSR-Safe Dynamic Import for Leaflet Map Canvas
const MapCanvasContainer = dynamic(
  () => import('./MapCanvasContainer').then((mod) => mod.MapCanvasContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
          Initializing EV Charging Map...
        </span>
      </div>
    ),
  }
);

export function InteractiveChargingMapModule() {
  const { activeCity, selectCity, detectLocationGps } = useCityStore();
  const { isAuthenticated } = useAuth();

  const [stations, setStations] = useState<StationData[]>([]);
  const [detailedStation, setDetailedStation] = useState<StationData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingStation, setReportingStation] = useState<StationData | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geofenceStation, setGeofenceStation] = useState<StationData | null>(null);

  // Location Permission Modal State
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    fastOnly: false,
    availableOnly: false,
    verifiedOnly: false,
    openNow: false,
    connectorType: 'All',
    operator: 'All',
  });

  // Fetch Map Station Pins Dynamically from Service Layer
  useEffect(() => {
    let isMounted = true;
    const filterOptions = {
      lat: userLocation ? userLocation[0] : 28.6139,
      lng: userLocation ? userLocation[1] : 77.2090,
      radiusKm: 30,
      connectorType: filters.connectorType,
      operator: filters.operator,
      fastOnly: filters.fastOnly,
      availabilityOnly: filters.availableOnly,
    };

    ChargingService.getMapStations(activeCity.id, filterOptions).then((data) => {
      if (isMounted) setStations(data);
    });
    return () => {
      isMounted = false;
    };
  }, [activeCity.id, filters, userLocation]);


  // Check initial location permission preference on mount & request GPS
  useEffect(() => {
    try {
      const locationPermissionHandled = localStorage.getItem('whyev_map_location_asked');
      if (!locationPermissionHandled) {
        setIsPermissionModalOpen(true);
      } else if (locationPermissionHandled === 'granted' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            // Save location on map entry if user previously granted permission
            void saveUserLocation(
              pos.coords.latitude,
              pos.coords.longitude,
              pos.coords.accuracy,
            );
          },
          () => {}
        );
      }
    } catch (e) {
      console.error(e);
    }
  }, []);


  // Request Location & Detect City
  const handleRequestLocation = async () => {
    try {
      localStorage.setItem('whyev_map_location_asked', 'granted');
    } catch (e) {}

    setIsPermissionModalOpen(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);

          const lat = pos.coords.latitude;
          let detectedCityId = 'delhi-ncr';
          if (lat > 25) detectedCityId = 'delhi-ncr';
          else if (lat > 18) detectedCityId = 'mumbai';
          else if (lat > 12) detectedCityId = 'bengaluru';

          selectCity(detectedCityId);

          if (isAuthenticated) {
            try {
              localStorage.setItem('whyev_user_synced_city', detectedCityId);
            } catch (e) {}
          }

          // Persist the location after the explicit Locate Me action.
          // Fire-and-forget: a failure here must never block the map or stations.
          void saveUserLocation(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.accuracy,
          );
        },
        (err) => {
          try {
            localStorage.setItem('whyev_map_location_asked', 'denied');
          } catch (e) {}

          // Handle all browser geolocation error codes gracefully.
          // Do NOT attempt to obtain location through any other method.
          // Do NOT send fake coordinates.
          if (err.code === err.PERMISSION_DENIED) {
            console.info('[WhyEV] Location permission denied by user.');
            // UI already shows the map — no action needed other than logging.
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            console.warn('[WhyEV] Location unavailable (GPS signal lost or device issue).');
          } else if (err.code === err.TIMEOUT) {
            console.warn('[WhyEV] Location request timed out.');
          }
        }
      );
    } else {
      detectLocationGps();
    }
  };

  const handleDenyLocation = () => {
    try {
      localStorage.setItem('whyev_map_location_asked', 'denied');
    } catch (e) {}
    setIsPermissionModalOpen(false);
  };

  // Passive Geofence Check — selects closest station if location available, else nearest real station
  useEffect(() => {
    const timer = setTimeout(() => {
      if (stations.length > 0) {
        if (userLocation) {
          const sorted = [...stations].sort((a, b) => {
            const distA = Math.hypot(a.lat - userLocation[0], a.lng - userLocation[1]);
            const distB = Math.hypot(b.lat - userLocation[0], b.lng - userLocation[1]);
            return distA - distB;
          });
          setGeofenceStation(sorted[0]);
        } else {
          setGeofenceStation(stations[0]);
        }
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [stations, userLocation]);


  // Handle Search Locality -> Opens StationDetailPanel directly
  const handleSearchSelect = (locality: string) => {
    const matched = stations.find((s) => s.locality.toLowerCase().includes(locality.toLowerCase()));
    if (matched) {
      setDetailedStation(matched);
    }
  };

  // Filter Pipeline
  const filteredStations = stations.filter((stn) => {
    if (filters.fastOnly && !stn.isFast) return false;
    if (filters.availableOnly && stn.connectors.every((c) => c.available === 0)) return false;
    if (filters.verifiedOnly && stn.confidencePct < 90) return false;
    if (filters.openNow && !stn.operatingHours.includes('24/7')) return false;
    if (filters.connectorType !== 'All') {
      if (!stn.connectors.some((c) => c.type === filters.connectorType)) return false;
    }
    return true;
  });

  const handleReportSubmitted = (status: StationStatusType, note?: string) => {
    if (!reportingStation) return;

    setStations((prev) =>
      prev.map((s) => {
        if (s.id === reportingStation.id) {
          const newReportCount = s.reportCount + 1;
          const updatedTimeline = [
            {
              id: `rep-${Date.now()}`,
              status,
              timeAgo: 'Just now',
              reporterType: 'Verified EV Driver',
            },
            ...s.timeline,
          ];
          return {
            ...s,
            status,
            reportCount: newReportCount,
            confidencePct: Math.min(100, s.confidencePct + 2),
            lastVerifiedMinutesAgo: 1,
            timeline: updatedTimeline,
          };
        }
        return s;
      })
    );
  };

  const handleResetFilters = () => {
    setFilters({
      fastOnly: false,
      availableOnly: false,
      verifiedOnly: false,
      openNow: false,
      connectorType: 'All',
      operator: 'All',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-100 font-sans">
      {/* First Visit Location Permission Modal */}
      <LocationPermissionModal
        isOpen={isPermissionModalOpen}
        onAllow={handleRequestLocation}
        onNotNow={handleDenyLocation}
      />

      {/* Top Header & Search Bar Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <SearchBar onSearchSelect={handleSearchSelect} onLocateMe={handleRequestLocation} />

        <div className="flex items-center justify-center mx-auto md:mx-0 gap-2 self-center md:self-auto pt-1 md:pt-0">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>{filteredStations.length} Active Stations in {activeCity.name}</span>
          </div>
        </div>
      </div>

      {/* Horizontal Filter Chips */}
      <FilterChipsBar
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* Passive Geofence Nearby Prompt Banner */}
      {geofenceStation && (
        <PassiveGeofenceBanner
          stationName={geofenceStation.name}
          onQuickReport={(st) => {
            setReportingStation(geofenceStation);
            handleReportSubmitted(st);
            setGeofenceStation(null);
          }}
          onDismiss={() => setGeofenceStation(null)}
        />
      )}

      {/* Main Full-Height React Leaflet Map Canvas */}
      <div className="relative w-full h-[420px] sm:h-[600px] lg:h-[680px]">
        <MapCanvasContainer
          stations={filteredStations}
          selectedStationId={detailedStation?.id || null}
          onStationSelect={(stn) => setDetailedStation(stn)}
          userLocation={userLocation}
          onLocateMe={handleRequestLocation}
        />
      </div>

      {/* Full Station Detail Drawer (Direct Flow: Map Marker/Popup -> StationDetailPanel) */}
      <StationDetailPanel
        station={detailedStation}
        onClose={() => setDetailedStation(null)}
        onOpenReportModal={(stn) => {
          setReportingStation(stn);
          setIsReportModalOpen(true);
        }}
      />

      {/* Crowdsourced Report Modal */}
      <CrowdsourcedReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        stationName={reportingStation?.name || ''}
        stationId={reportingStation?.id || ''}
        onReportSubmitted={handleReportSubmitted}
      />
    </div>
  );
}
