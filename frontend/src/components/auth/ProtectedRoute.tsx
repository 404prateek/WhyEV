'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/buttons/Button';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Sign-in is optional — allow all users (guest or logged-in) to view content seamlessly
  return <>{children}</>;
}
