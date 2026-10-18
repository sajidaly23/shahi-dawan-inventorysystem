'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { TablesView } from '@/components/modules/Tables/TablesView';

export default function TablesPage() {
  const router = useRouter();

  return (
    <TablesView onNavigateToPos={() => router.push('/dashboard/pos')} />
  );
}
