'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Navigation, X, MapPin } from 'lucide-react';

interface SearchBarProps {
  onSearchSelect: (locality: string) => void;
  onLocateMe: () => void;
}

const LOCALITY_SUGGESTIONS = [
  { name: 'Connaught Place', area: 'Central Delhi', metro: 'Rajiv Chowk Metro' },
  { name: 'Saket', area: 'South Delhi', metro: 'Select CITYWALK Mall' },
  { name: 'Aerocity', area: 'SW Delhi', metro: 'Delhi Airport T3' },
  { name: 'Gurugram', area: 'NCR', metro: 'DLF CyberHub' },
  { name: 'Noida', area: 'NCR', metro: 'Sector 18 Metro' },
  { name: 'Dwarka', area: 'West Delhi', metro: 'Sector 21 Metro Interchange' },
  { name: 'Rohini', area: 'North Delhi', metro: 'Sector 10 Metro' },
];

export function SearchBar({ onSearchSelect, onLocateMe }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuggestions = LOCALITY_SUGGESTIONS.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.area.toLowerCase().includes(query.toLowerCase()) ||
      item.metro.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <div className="relative flex items-center bg-white border border-slate-200/90 rounded-full shadow-sm hover:border-emerald-500/80 focus-within:border-emerald-500/80 transition-all">
        <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search locality, metro station, or 'charging near me'..."
          className="w-full bg-transparent px-3 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-1 text-slate-400 hover:text-slate-700 mr-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => {
            onLocateMe();
            setIsOpen(false);
          }}
          className="px-4 py-2 mr-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5 fill-white" />
          <span className="hidden sm:inline">Near Me</span>
        </button>
      </div>

      {/* Auto-complete Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden z-50 text-xs text-slate-900">
          <div className="p-2 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Delhi NCR Popular Localities
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {filteredSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(item.name);
                  onSearchSelect(item.name);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-extrabold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-400">{item.metro}</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-800">
                  {item.area}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
