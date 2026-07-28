'use client';

import React from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function AdminPage() {
  return (
    <ProtectedRoute>
      <div className="w-full pb-16">
        <AdminDashboard />
      </div>
    </ProtectedRoute>
  );
}
