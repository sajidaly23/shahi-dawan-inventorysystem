import React, { useState, useEffect } from 'react';
import { DbProvider, useDb } from './context/DbContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';

// Module Views
import { DashboardView } from './components/modules/Dashboard/DashboardView';
import { RecipesView } from './components/modules/Recipes/RecipesView';
import { RawMaterialsView } from './components/modules/RawMaterials/RawMaterialsView';
import { PurchasesView } from './components/modules/Purchases/PurchasesView';
import { POSView } from './components/modules/POS/POSView';
import { KDSView } from './components/modules/KDS/KDSView';
import { StockLedgerView } from './components/modules/StockLedger/StockLedgerView';
import { WasteView } from './components/modules/Waste/WasteView';
import { MenuView } from './components/modules/Menu/MenuView';
import { TablesView } from './components/modules/Tables/TablesView';
import { HotelPMSView } from './components/modules/HotelPMS/HotelPMSView';
import { FolioBillingView } from './components/modules/FolioBilling/FolioBillingView';
import { GuestsView } from './components/modules/Guests/GuestsView';
import { SuppliersView } from './components/modules/Suppliers/SuppliersView';
import { ReportsView } from './components/modules/Reports/ReportsView';
import { AuditLogsView } from './components/modules/AuditLogs/AuditLogsView';
import { SettingsView } from './components/modules/Settings/SettingsView';

const MainLayout: React.FC = () => {
  const { settings } = useDb();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const isLight = settings?.theme === 'light';

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [isLight]);

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 relative selection:bg-amber-500/30 selection:text-amber-300 ${
        isLight
          ? 'bg-slate-100 text-slate-900'
          : 'bg-[#090d16] text-slate-100'
      }`}
    >
      {/* Ambient Luxury Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 ${
            isLight ? 'bg-amber-300' : 'bg-amber-500/30'
          }`}
        />
        <div
          className={`absolute top-1/3 -right-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-10 pointer-events-none transition-all duration-700 ${
            isLight ? 'bg-sky-200' : 'bg-blue-600/20'
          }`}
        />
      </div>

      {/* Top Fixed Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNavigate={handleNavigate}
      />

      {/* Body Layout: Sidebar + Main View */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          {activeTab === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
          {activeTab === 'recipes' && <RecipesView />}
          {activeTab === 'raw-materials' && <RawMaterialsView />}
          {activeTab === 'purchases' && <PurchasesView />}
          {activeTab === 'pos' && <POSView />}
          {activeTab === 'kds' && <KDSView onNavigateToPos={() => handleNavigate('pos')} />}
          {activeTab === 'stock-ledger' && <StockLedgerView />}
          {activeTab === 'waste' && <WasteView />}
          {activeTab === 'menu' && <MenuView onNavigateToRecipes={() => handleNavigate('recipes')} />}
          {activeTab === 'tables' && <TablesView onNavigateToPos={() => handleNavigate('pos')} />}
          {activeTab === 'hotel-pms' && <HotelPMSView onNavigateToFolio={() => handleNavigate('folio-billing')} />}
          {activeTab === 'folio-billing' && <FolioBillingView />}
          {activeTab === 'guests' && <GuestsView />}
          {activeTab === 'suppliers' && <SuppliersView onNavigateToPurchases={() => handleNavigate('purchases')} />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'audit-logs' && <AuditLogsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Floating Global Toasts */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <DbProvider>
      <MainLayout />
    </DbProvider>
  );
}

export default App;
