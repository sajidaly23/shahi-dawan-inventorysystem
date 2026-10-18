'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { KDSView } from '@/components/modules/KDS/KDSView';

export default function KitchenPage() {
  const router = useRouter();

  return (
    <KDSView onNavigateToPos={() => router.push('/dashboard/pos')} />
  );
}
