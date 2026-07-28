'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import propertyDataRaw from '@/data/recommendation/delhiPropertyTypes.json';
import { PropertyCard, PropertyTypeData } from './PropertyCard';

interface PropertySelectionGridProps {
  selectedPropertyId: string;
  onSelectProperty: (id: string) => void;
}

export function PropertySelectionGrid({
  selectedPropertyId,
  onSelectProperty,
}: PropertySelectionGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const properties = propertyDataRaw as PropertyTypeData[];

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryTag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Filter Search Input */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Select Your Residential Property Category in Delhi NCR
          </h3>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            20 major Delhi residential property types covered for exact charging feasibility & policy alignment.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search property type..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
        </div>
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProperties.map((prop) => (
          <PropertyCard
            key={prop.id}
            property={prop}
            isSelected={selectedPropertyId === prop.id}
            onSelect={onSelectProperty}
          />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-10 bg-slate-50 rounded-3xl border border-slate-200 text-slate-500 text-xs">
          No matching Delhi property type found. Try searching "Apartment", "Floor", or "Villa".
        </div>
      )}
    </div>
  );
}
