'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import stationsData from '@/data/charging/chargingStations.json';
import { StationData, PreviewPanel } from './PreviewPanel';
import { StationDetailPanel } from './StationDetailPanel';
import { CrowdsourcedReportModal } from './CrowdsourcedReportModal';
import { PassiveGeofenceBanner } from './PassiveGeofenceBanner';
import { SearchBar } from './SearchBar';
import { FilterChipsBar, FilterState } from './FilterChipsBar';
import { StationStatusType } from './StatusBadge';

// SSR-Safe Dynamic Import for Leaflet Map Canvas
const MapCanvasContainer = dynamic(
  () => import('./MapCanvasContainer').then((mod) => mod.MapCanvasContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
          Initializing Tesla-Style EV Charging Map...
        </span>
      </div>
    ),
  }
);

export function InteractiveChargingMapModule() {
  const [stations, setStations] = useState<StationData[]>(stationsData as StationData[]);
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [detailedStation, setDetailedStation] = useState<StationData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportingStation, setReportingStation] = useState<StationData | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [geofenceStation, setGeofenceStation] = useState<StationData | null>(null);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    fastOnly: false,
    availableOnly: false,
    verifiedOnly: false,
    openNow: false,
    connectorType: 'All',
    operator: 'All',
  });

  // Request GPS User Location
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
        },
        () => {
          alert('GPS Location access was denied or is unavailable.');
        }
      );
    }
  };

  // Passive Geofence Check (Simulated trigger for demo)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (stations.length > 0) {
        setGeofenceStation(stations[0]); // Prompts for Connaught Place station
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [stations]);

  // Handle Search Locality
  const handleSearchSelect = (locality: string) => {
    const matched = stations.find((s) => s.locality.toLowerCase().includes(locality.toLowerCase()));
    if (matched) {
      setSelectedStation(matched);
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
      {/* Top Header & Search Bar Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <SearchBar onSearchSelect={handleSearchSelect} onLocateMe={handleLocateMe} />

        <div className="flex items-center justify-center mx-auto md:mx-0 gap-2 self-center md:self-auto pt-1 md:pt-0">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            <span>{filteredStations.length} Active Stations in Delhi NCR</span>
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
          selectedStationId={selectedStation?.id || null}
          onStationSelect={(stn) => setSelectedStation(stn)}
          userLocation={userLocation}
          onLocateMe={handleLocateMe}
        />

        {/* Desktop Right Panel / Mobile Bottom Sheet Preview */}
        <PreviewPanel
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
          onViewDetails={(stn) => setDetailedStation(stn)}
          onOpenReportModal={(stn) => {
            setReportingStation(stn);
            setIsReportModalOpen(true);
          }}
        />
      </div>

      {/* Full Station Detail Drawer */}
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
