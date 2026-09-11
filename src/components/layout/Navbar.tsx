import React, { useState, useEffect } from 'react';
import { useDb } from '../../context/DbContext';
import { UserRole } from '../../types';
import {
  Bell,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Upload,
  UserCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  ShoppingBag,
  PlusCircle,
  Menu,
} from 'lucide-react';
import { smartFormatBaseQuantity } from '../../utils/unitConverter';

interface NavbarProps {
  onToggleSidebar: () => void;
  onNavigate: (tabId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNavigate }) => {
  const {
    settings,
    currentUser,
    setCurrentUser,
    users,
    rawMaterials,
    updateSettings,
    resetAllData,
    exportDatabaseJSON,
    importDatabaseJSON,
    showToast,
  } = useDb();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const lowStockItems = rawMaterials.filter(
    (m) => m.status === 'low_stock' || m.status === 'out_of_stock'
  );

  const handleExport = () => {
    const json = exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shahi_diwan_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Backup Exported', 'Database backup downloaded successfully.');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const roleBadges: Record<UserRole, { label: string; bg: string }> = {
    admin: { label: 'General Director (Admin)', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
    manager: { label: 'Operations Manager', bg: 'bg-blue-100 text-blue-800 border-blue-300' },
    inventory_manager: { label: 'Inventory Head', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    cashier: { label: 'POS Cashier', bg: 'bg-purple-100 text-purple-800 border-purple-300' },
    waiter: { label: 'Floor Server', bg: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    kitchen: { label: 'Master Chef', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
    receptionist: { label: 'Front Desk Reception', bg: 'bg-sky-100 text-sky-800 border-sky-300' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs no-print">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Left Side: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition lg:hidden"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-[1px] shadow-md shadow-amber-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center">
                <span className="font-royal text-xl font-bold gold-gradient-text">S</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-wide font-royal leading-none">
                  {settings.businessName}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                {settings.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Clock & Quick Launch */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>{currentTime}</span>
          </div>

          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition transform active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </button>
        </div>

        {/* Right Side: Role Switcher, Alerts, Audio, Backups */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio Toggle */}
          <button
            onClick={() => updateSettings({ enableSoundFx: !settings.enableSoundFx })}
            className={`p-2 rounded-xl border transition ${
              settings.enableSoundFx
                ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
            }`}
            title={settings.enableSoundFx ? 'Mute System Sounds' : 'Enable System Sounds'}
          >
            {settings.enableSoundFx ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Low Stock Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-xl border transition ${
                lowStockItems.length > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
              }`}
              title="Stock Alerts"
            >
              <Bell className="w-4 h-4" />
              {lowStockItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-bounce">
                  {lowStockItems.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Inventory Stock Alerts ({lowStockItems.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('raw-materials');
                    }}
                    className="text-[11px] text-amber-600 font-bold hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {lowStockItems.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      All raw materials are well stocked above minimum thresholds.
                    </div>
                  ) : (
                    lowStockItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigate('purchases');
                        }}
                        className="p-3 hover:bg-slate-50 cursor-pointer transition flex items-start gap-3"
                      >
                        <div
                          className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                            item.status === 'out_of_stock'
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 truncate">{item.name}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                item.status === 'out_of_stock'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {item.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            Current: <span className="text-slate-900 font-mono">{smartFormatBaseQuantity(item.currentQty, item.baseUnit)}</span> (Min: {item.minStockLevel} {item.unit})
                          </p>
                          <span className="text-[10px] text-amber-600 font-medium">Click to create Purchase Order →</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Backup / Restore Menu */}
          <div className="hidden sm:flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={handleExport}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Export Full Database JSON Backup"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              title="Import Database JSON Backup"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={() => {
                if (window.confirm('Reset all restaurant and hotel data back to initial realistic demo seed?')) {
                  resetAllData();
                }
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition"
              title="Reset to Initial Seed Demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Role-Based Access Control Switcher */}
          <div className="relative border-l border-slate-200 pl-2 sm:pl-3">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition text-left"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-amber-500/40"
              />
              <div className="hidden md:block">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[110px]">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-amber-700 font-bold uppercase">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <UserCheck className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-50 animate-fade-in">
                <div className="p-3 bg-slate-50 border-b border-slate-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Switch Active Staff Role
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Simulate different ERP user roles with real-time UI adaptation.
                  </p>
                </div>
                <div className="p-2 space-y-1">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowRoleMenu(false);
                        showToast('info', 'Active User Switched', `Now operating as ${u.name} (${u.title}).`);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition ${
                        currentUser.id === u.id
                          ? 'bg-amber-50 border border-amber-300 text-slate-900'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{u.title}</div>
                        <span
                          className={`inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded border font-semibold ${
                            roleBadges[u.role]?.bg
                          }`}
                        >
                          {roleBadges[u.role]?.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
