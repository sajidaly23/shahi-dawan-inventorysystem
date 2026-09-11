import React from 'react';
import { useDb } from '../../context/DbContext';
import {
  LayoutDashboard,
  Boxes,
  Truck,
  BookOpen,
  UtensilsCrossed,
  ShoppingBag,
  ChefHat,
  History,
  Trash2,
  Table,
  Building2,
  Receipt,
  Users,
  Contact,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { rawMaterials, tables, rooms, currentUser } = useDb();

  const lowStockCount = rawMaterials.filter(
    (m) => m.status === 'low_stock' || m.status === 'out_of_stock'
  ).length;

  const activeTablesCount = tables.filter((t) => t.status === 'occupied').length;
  const occupiedRoomsCount = rooms.filter((r) => r.status === 'occupied').length;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: 'rose' | 'amber' | 'emerald' | 'blue';
    highlight?: boolean;
    roles?: string[];
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: 'Executive Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'INVENTORY & RECIPE BOM',
      items: [
        {
          id: 'recipes',
          label: 'Recipe / BOM Engine',
          icon: <BookOpen className="w-4 h-4" />,
          highlight: true,
          badge: 'Core BOM',
          badgeColor: 'amber',
        },
        {
          id: 'raw-materials',
          label: 'Raw Materials & Stock',
          icon: <Boxes className="w-4 h-4" />,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeColor: 'rose',
        },
        {
          id: 'purchases',
          label: 'Stock In / Purchases',
          icon: <Truck className="w-4 h-4" />,
        },
        {
          id: 'stock-ledger',
          label: 'Stock Ledger Trail',
          icon: <History className="w-4 h-4" />,
        },
        {
          id: 'waste',
          label: 'Waste Management',
          icon: <Trash2 className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'RESTAURANT & POS',
      items: [
        {
          id: 'pos',
          label: 'POS Order Terminal',
          icon: <ShoppingBag className="w-4 h-4" />,
          highlight: true,
        },
        {
          id: 'kds',
          label: 'Kitchen Display (KDS)',
          icon: <ChefHat className="w-4 h-4" />,
        },
        {
          id: 'menu',
          label: 'Menu Items & Pricing',
          icon: <UtensilsCrossed className="w-4 h-4" />,
        },
        {
          id: 'tables',
          label: 'Floor Plan & Tables',
          icon: <Table className="w-4 h-4" />,
          badge: activeTablesCount > 0 ? `${activeTablesCount} Live` : undefined,
          badgeColor: 'blue',
        },
      ],
    },
    {
      title: 'HOTEL & ROOM FOLIO',
      items: [
        {
          id: 'hotel-pms',
          label: 'Room Matrix & PMS',
          icon: <Building2 className="w-4 h-4" />,
          badge: occupiedRoomsCount > 0 ? `${occupiedRoomsCount} Occ` : undefined,
          badgeColor: 'emerald',
        },
        {
          id: 'folio-billing',
          label: 'Hotel + Dining Folios',
          icon: <Receipt className="w-4 h-4" />,
          badge: 'Integrated',
          badgeColor: 'amber',
        },
        {
          id: 'guests',
          label: 'Guest Directory CRM',
          icon: <Users className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'ADMIN & INTELLIGENCE',
      items: [
        {
          id: 'suppliers',
          label: 'Suppliers Directory',
          icon: <Contact className="w-4 h-4" />,
        },
        {
          id: 'reports',
          label: 'Analytics & Financials',
          icon: <BarChart3 className="w-4 h-4" />,
        },
        {
          id: 'audit-logs',
          label: 'Audit & Compliance',
          icon: <ShieldCheck className="w-4 h-4" />,
        },
        {
          id: 'settings',
          label: 'System Parameters',
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden no-print"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800 transition-transform duration-300 ease-in-out flex flex-col no-print lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {group.title}
              </div>
              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`${
                            isActive ? 'text-slate-950' : item.highlight ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'
                          }`}
                        >
                          {item.icon}
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tight shrink-0 ${
                            isActive
                              ? 'bg-slate-950/20 text-slate-950'
                              : item.badgeColor === 'rose'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : item.badgeColor === 'amber'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : item.badgeColor === 'emerald'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card at Bottom */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-amber-500/40 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-amber-400 truncate">{currentUser.title}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
