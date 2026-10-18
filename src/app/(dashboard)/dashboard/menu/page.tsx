'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MenuView } from '@/components/modules/Menu/MenuView';

export default function MenuPage() {
  const router = useRouter();

  return (
    <MenuView onNavigateToRecipes={() => router.push('/dashboard/recipes')} />
  );
}
