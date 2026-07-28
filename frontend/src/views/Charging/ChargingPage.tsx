'use client';

import React from 'react';
import { ChargingMapView } from '@/components/charging/ChargingMapView';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function ChargingPage() {
  return (
    <ProtectedRoute>
      <div className="w-full pb-16">
        <ChargingMapView />
      </div>
    </ProtectedRoute>
  );
}
