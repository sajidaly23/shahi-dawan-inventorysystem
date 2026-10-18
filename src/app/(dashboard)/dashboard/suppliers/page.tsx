'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { SuppliersView } from '@/components/modules/Suppliers/SuppliersView';

export default function SuppliersPage() {
  const router = useRouter();

  return (
    <SuppliersView onNavigateToPurchases={() => router.push('/dashboard/stock-in')} />
  );
}
