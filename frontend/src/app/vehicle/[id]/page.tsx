import React from 'react';
import { VehicleDetailsView } from '@/views/VehicleDetails/VehicleDetailsView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <VehicleDetailsView vehicleId={id} />;
}
