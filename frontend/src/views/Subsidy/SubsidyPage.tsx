'use client';

import React from 'react';
import { SubsidyCalculator } from '@/components/subsidy/SubsidyCalculator';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function SubsidyPage() {
  return (
    <ProtectedRoute>
      <div className="w-full pb-16">
        <SubsidyCalculator />
      </div>
    </ProtectedRoute>
  );
}
