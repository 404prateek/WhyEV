'use client';

import React from 'react';
import { MarketplaceView } from '@/components/marketplace/MarketplaceView';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function MarketplacePage() {
  return (
    <ProtectedRoute>
      <div className="w-full pb-16">
        <MarketplaceView />
      </div>
    </ProtectedRoute>
  );
}
