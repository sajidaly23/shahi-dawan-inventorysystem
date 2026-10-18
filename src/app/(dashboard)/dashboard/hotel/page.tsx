'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { HotelPMSView } from '@/components/modules/HotelPMS/HotelPMSView';

export default function HotelPage() {
  const router = useRouter();

  return (
    <HotelPMSView onNavigateToFolio={() => router.push('/dashboard/folio-billing')} />
  );
}
