'use client';

import React from 'react';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="w-full pb-16">
        <DashboardOverview />
      </div>
    </ProtectedRoute>
  );
}
