'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Layers,
  Building,
  Building2,
  Layout,
  Castle,
  Landmark,
  TreePine,
  Grid,
  Copy,
  Sparkles,
  ShieldCheck,
  Compass,
  Briefcase,
  Users,
  Award,
  Key,
  UserCheck,
  Coffee,
  Crown,
  CheckCircle2,
} from 'lucide-react';

export interface PropertyTypeData {
  id: string;
  title: string;
  desc: string;
  iconName: string;
  categoryTag: string;
}

interface PropertyCardProps {
  property: PropertyTypeData;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function PropertyCard({ property, isSelected, onSelect }: PropertyCardProps) {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Home':
        return Home;
      case 'Layers':
        return Layers;
      case 'Building':
        return Building;
      case 'Building2':
        return Building2;
      case 'Layout':
        return Layout;
      case 'Castle':
        return Castle;
      case 'Landmark':
        return Landmark;
      case 'TreePine':
        return TreePine;
      case 'Grid':
        return Grid;
      case 'Copy':
        return Copy;
      case 'Sparkles':
        return Sparkles;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'Compass':
        return Compass;
      case 'Briefcase':
        return Briefcase;
      case 'Users':
        return Users;
      case 'Award':
        return Award;
      case 'Key':
        return Key;
      case 'UserCheck':
        return UserCheck;
      case 'Coffee':
        return Coffee;
      case 'Crown':
        return Crown;
      default:
        return Home;
    }
  };

  const IconComp = getIcon(property.iconName);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(property.id);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(property.id)}
      onKeyDown={handleKeyDown}
      className={`p-5 rounded-3xl border text-left transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-emerald-500 relative flex flex-col justify-between ${
        isSelected
          ? 'bg-emerald-50/90 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs'
      }`}
    >
      {/* Top Row: Icon & Category Tag / Checkmark */}
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
          }`}
        >
          <IconComp className="w-5 h-5" />
        </div>

        {isSelected ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100 shrink-0" />
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/80">
            {property.categoryTag}
          </span>
        )}
      </div>

      {/* Title & One-Line Description */}
      <div className="space-y-1">
        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{property.title}</h4>
        <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-2">
          {property.desc}
        </p>
      </div>
    </motion.div>
  );
}
