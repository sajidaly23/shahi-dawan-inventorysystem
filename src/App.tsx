import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-amber-500/30 selection:text-amber-900">
      {/* Top Fixed Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNavigate={handleNavigate}
      />

      {/* Body Layout: Sidebar + Main View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <DashboardView onNavigate={handleNavigate} />}
          {activeTab === 'recipes' && <RecipesView />}
          {activeTab === 'raw-materials' && <RawMaterialsView />}
          {activeTab === 'purchases' && <PurchasesView />}
          {activeTab === 'pos' && <POSView />}
          {activeTab === 'kds' && <KDSView />}
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
