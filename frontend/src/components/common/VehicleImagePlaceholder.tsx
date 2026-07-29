'use client';

import React from 'react';

interface VehicleImagePlaceholderProps {
  make: string;
  model: string;
  category?: string;
  className?: string;
}

const VEHICLE_PHOTO_MAP: Record<string, string> = {
  // 4W EVs
  'tiago ev': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
  'comet ev': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
  'punch ev': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800&auto=format&fit=crop',
  'ë-c3 / ec3x': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop',
  'ec3': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=800&auto=format&fit=crop',
  'nexon ev': 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop',
  'tigor ev': 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=800&auto=format&fit=crop',
  'syros ev': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop',
  'xuv 3xo ev': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
  'windsor ev': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=800&auto=format&fit=crop',
  'xuv400': 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=800&auto=format&fit=crop',
  'zs ev': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800&auto=format&fit=crop',
  'ioniq 5': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=800&auto=format&fit=crop',
  'ev6': 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=800&auto=format&fit=crop',

  // 2W Scooter / Bike EVs
  'ather 450x': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop',
  'ola s1 pro': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop',
  'tvs iqube': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop',
  'bajaj chetak': 'https://images.unsplash.com/photo-1558981285-6f0c94958bb6?q=80&w=800&auto=format&fit=crop',

  // 3W EVs
  'treo': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
  'ape e-city': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
};

const CATEGORY_DEFAULT_PHOTOS: Record<string, string> = {
  '2W': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop',
  '3W': 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
  '4W': 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=800&auto=format&fit=crop',
};

export function getVehiclePhotoUrl(make: string, model: string, category: string = '4W'): string {
  const key = (model || '').toLowerCase();
  for (const [k, url] of Object.entries(VEHICLE_PHOTO_MAP)) {
    if (key.includes(k)) return url;
  }
  return CATEGORY_DEFAULT_PHOTOS[category] || CATEGORY_DEFAULT_PHOTOS['4W'];
}

export function VehicleImagePlaceholder({
  make,
  model,
  category = '4W',
  className = 'h-56 w-full',
}: VehicleImagePlaceholderProps) {
  const photoUrl = getVehiclePhotoUrl(make, model, category);

  return (
    <div className={`relative ${className} bg-slate-900 overflow-hidden`}>
      <img
        src={photoUrl}
        alt={`${make} ${model}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

      {/* Model Name & Category Overlay */}
      <div className="absolute bottom-3 left-3 z-10 text-white">
        <div className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider">{make}</div>
        <div className="text-sm font-extrabold">{model}</div>
      </div>
    </div>
  );
}
