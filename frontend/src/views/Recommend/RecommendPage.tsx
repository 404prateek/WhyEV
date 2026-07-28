'use client';

import React from 'react';
import { RecommendationWizard } from '@/components/recommend/RecommendationWizard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function RecommendPage() {
  return (
    <ProtectedRoute>
      <div className="w-full pb-16">
        <RecommendationWizard />
      </div>
    </ProtectedRoute>
  );
}
