'use client';

import React from 'react';
import { BatteryReportView } from '@/components/battery/BatteryReportView';

export function BatteryCertPage() {
  return (
    <div className="w-full pb-16">
      <BatteryReportView />
    </div>
  );
}
