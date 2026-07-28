'use client';

import React from 'react';
import { BatteryReportView } from '@/components/battery/BatteryReportView';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function BatteryCertPage() {
  return (
    <ProtectedRoute>
      <div className="w-full pb-16">
        <BatteryReportView />
      </div>
    </ProtectedRoute>
  );
}
