'use client';

import React from 'react';
import { BatteryCertView } from '@/views/BatteryCert/BatteryCertView';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function BatteryCertPage() {
  return (
    <ProtectedRoute>
      <div className="w-full pb-16">
        <BatteryCertView />
      </div>
    </ProtectedRoute>
  );
}
