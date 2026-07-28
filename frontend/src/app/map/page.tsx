import React, { Suspense } from 'react';
import { ChargingPage } from '@/views/Charging/ChargingPage';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-slate-50/50">
          <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-lg text-slate-500 text-sm animate-pulse">
            Loading WhyEV Map...
          </div>
        </div>
      }
    >
      <ChargingPage />
    </Suspense>
  );
}
