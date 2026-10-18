'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useDb } from '@/context/DbContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { settings } = useDb();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Map route pathname to active sidebar tab id
  const getActiveTab = () => {
    if (pathname.includes('/kitchen')) return 'kds';
    if (pathname.includes('/pos')) return 'pos';
    if (pathname.includes('/raw-materials') || pathname.includes('/inventory')) return 'raw-materials';
    if (pathname.includes('/stock-in')) return 'purchases';
    if (pathname.includes('/stock-out')) return 'waste';
    if (pathname.includes('/stock-ledger')) return 'stock-ledger';
    if (pathname.includes('/recipes')) return 'recipes';
    if (pathname.includes('/menu')) return 'menu';
    if (pathname.includes('/suppliers')) return 'suppliers';
    if (pathname.includes('/tables')) return 'tables';
    if (pathname.includes('/folio-billing')) return 'folio-billing';
    if (pathname.includes('/guests')) return 'guests';
    if (pathname.includes('/hotel')) return 'hotel-pms';
    if (pathname.includes('/audit-logs')) return 'audit-logs';
    if (pathname.includes('/reports')) return 'reports';
    if (pathname.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const handleNavigate = (tabId: string) => {
    const routeMap: Record<string, string> = {
      dashboard: '/dashboard',
      recipes: '/dashboard/recipes',
      'raw-materials': '/dashboard/raw-materials',
      purchases: '/dashboard/stock-in',
      'stock-ledger': '/dashboard/stock-ledger',
      waste: '/dashboard/stock-out',
      pos: '/dashboard/pos',
      kds: '/dashboard/kitchen',
      menu: '/dashboard/menu',
      tables: '/dashboard/tables',
      'hotel-pms': '/dashboard/hotel',
      'folio-billing': '/dashboard/folio-billing',
      guests: '/dashboard/guests',
      suppliers: '/dashboard/suppliers',
      reports: '/dashboard/reports',
      'audit-logs': '/dashboard/audit-logs',
      settings: '/dashboard/settings',
    };

    const target = routeMap[tabId] || '/dashboard';
    router.push(target);
    setIsSidebarOpen(false);
  };

  const isLight = settings?.theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 relative ${
        isLight ? 'bg-slate-100 text-slate-900' : 'bg-[#090d16] text-slate-100'
      }`}
    >
      {/* Ambient Radial Luxury Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none bg-amber-500/30" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 pointer-events-none bg-blue-600/20" />
      </div>

      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNavigate={handleNavigate}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <Sidebar
          activeTab={getActiveTab()}
          onSelectTab={handleNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
