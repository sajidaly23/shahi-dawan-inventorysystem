'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardView } from '@/components/modules/Dashboard/DashboardView';

export default function DashboardPage() {
  const router = useRouter();

  const handleNavigate = (tabId: string) => {
    const routeMap: Record<string, string> = {
      dashboard: '/dashboard',
      recipes: '/dashboard/recipes',
      'raw-materials': '/dashboard/raw-materials',
      purchases: '/dashboard/stock-in',
      'stock-ledger': '/dashboard/reports?tab=ledger',
      waste: '/dashboard/stock-out',
      pos: '/dashboard/pos',
      kds: '/dashboard/kitchen',
      tables: '/dashboard/tables',
      'hotel-pms': '/dashboard/hotel',
      reports: '/dashboard/reports',
      settings: '/dashboard/settings',
    };
    router.push(routeMap[tabId] || '/dashboard');
  };

  return <DashboardView onNavigate={handleNavigate} />;
}
