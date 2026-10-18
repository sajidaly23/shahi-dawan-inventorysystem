'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Menu,
  Sun,
  Moon,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  LogOut,
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
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  const isLight = settings?.theme === 'light';

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      showToast('info', 'Logged Out', 'Signed out successfully. Returning to home...');
    } catch (e) {
      // Continue redirect even on network hiccup
    } finally {
      window.location.href = '/';
    }
  };

  // Live real-time clock
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

  // Click-outside listener to dismiss dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        roleMenuRef.current &&
        !roleMenuRef.current.contains(event.target as Node)
      ) {
        setShowRoleMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifications(false);
        setShowRoleMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const lowStockItems = rawMaterials.filter(
    (m) => m.status === 'low_stock' || m.status === 'out_of_stock'
  );

  const toggleTheme = () => {
    const nextTheme = isLight ? 'dark' : 'light';
    updateSettings({ theme: nextTheme });
    showToast('info', 'Theme Switched', `Switched to ${nextTheme === 'dark' ? 'Executive Dark Luxury' : 'Royal Ivory Light'} theme.`);
  };

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
    admin: { label: 'General Director', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    manager: { label: 'Operations Manager', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    inventory_manager: { label: 'Inventory Head', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    cashier: { label: 'POS Cashier', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    waiter: { label: 'Floor Server', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    kitchen: { label: 'Master Chef', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    receptionist: { label: 'Front Desk', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 backdrop-blur-xl border-b no-print ${
        isLight
          ? 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
          : 'bg-[#0b101d]/90 border-slate-800/80 text-slate-100 shadow-xl shadow-black/30'
      }`}
    >
      <div className="flex items-center justify-between px-3 sm:px-6 h-16">
        {/* Left Side: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onToggleSidebar}
            className={`p-2 rounded-xl transition lg:hidden ${
              isLight
                ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-[1.5px] shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#0a0e1a] rounded-[10px] flex items-center justify-center">
                  <span className="font-royal text-xl font-bold gold-gradient-text tracking-wider">
                    S
                  </span>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0b101d]" />
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-wide font-royal leading-none text-white drop-shadow-xs">
                  {settings.businessName}
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-widest royal-badge">
                  Enterprise
                </span>
              </div>
              <p
                className={`text-[11px] font-medium leading-tight mt-0.5 ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {settings.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Clock & Quick POS Launch */}
        <div className="hidden md:flex items-center gap-4">
          <div
            className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-slate-900/80 border-slate-800 text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="font-semibold tracking-wider">{currentTime}</span>
          </div>

          <button
            onClick={() => onNavigate('pos')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition transform active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-slate-950" />
            <span>Open Order Billing</span>
          </button>
        </div>

        {/* Right Side: Theme, Role Switcher, Alerts, Audio, Backups */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Theme Switcher */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isLight
                ? 'bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200'
                : 'bg-slate-900/90 border-slate-800 text-amber-400 hover:bg-slate-800 hover:border-amber-500/40'
            }`}
            title={`Switch to ${isLight ? 'Executive Dark' : 'Royal Ivory Light'} Theme`}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Audio FX Toggle */}
          <button
            onClick={() => updateSettings({ enableSoundFx: !settings.enableSoundFx })}
            className={`p-2 rounded-xl border transition-all ${
              settings.enableSoundFx
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20'
                : isLight
                ? 'bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-800'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title={settings.enableSoundFx ? 'Mute System Audio FX' : 'Enable System Audio FX'}
          >
            {settings.enableSoundFx ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Low Stock Notifications with Click-Outside Guard */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowRoleMenu(false);
              }}
              className={`relative p-2 rounded-xl border transition-all ${
                lowStockItems.length > 0
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 hover:bg-rose-500/25'
                  : isLight
                  ? 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
              title="Stock Alerts"
            >
              <Bell className="w-4 h-4" />
              {lowStockItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center animate-bounce shadow-md shadow-rose-500/50">
                  {lowStockItems.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div
                className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-fade-in ${
                  isLight
                    ? 'bg-white border-slate-200'
                    : 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-black/80'
                }`}
              >
                <div
                  className={`px-4 py-3 border-b flex items-center justify-between ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Inventory Stock Alerts ({lowStockItems.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('raw-materials');
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
                  {lowStockItems.length === 0 ? (
                    <div className="p-6 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-slate-300">
                        All Raw Materials Well Stocked
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Every ingredient is currently above its safety buffer threshold.
                      </p>
                    </div>
                  ) : (
                    lowStockItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowNotifications(false);
                          onNavigate('purchases');
                        }}
                        className={`p-3.5 hover:bg-slate-800/40 cursor-pointer transition flex items-start gap-3`}
                      >
                        <div
                          className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                            item.status === 'out_of_stock'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white truncate">{item.name}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase shrink-0 ${
                                item.status === 'out_of_stock'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {item.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Current:{' '}
                            <span className="text-amber-400 font-mono font-semibold">
                              {smartFormatBaseQuantity(item.currentQty, item.baseUnit)}
                            </span>{' '}
                            (Min: {item.minStockLevel} {item.unit})
                          </p>
                          <span className="text-[10px] text-amber-400/90 font-medium hover:underline inline-block mt-0.5">
                            Click to create Purchase Order →
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Backup & Demo Controls */}
          <div
            className={`hidden sm:flex items-center gap-1 border-l pl-2 ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <button
              onClick={handleExport}
              className={`p-2 rounded-xl transition ${
                isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Export Full Database JSON Backup"
            >
              <Download className="w-4 h-4" />
            </button>
            <label
              className={`p-2 rounded-xl transition cursor-pointer ${
                isLight
                  ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
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
              className={`p-2 rounded-xl transition ${
                isLight
                  ? 'text-slate-500 hover:text-amber-600 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
              }`}
              title="Reset to Initial Seed Demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Role-Based Access Control Switcher with Click-Outside Guard */}
          <div
            className={`relative border-l pl-2 sm:pl-3 ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
            ref={roleMenuRef}
          >
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border transition text-left cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900'
                  : 'bg-slate-900/90 hover:bg-slate-800/80 border-slate-800 text-white hover:border-amber-500/40'
              }`}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-amber-500/40"
              />
              <div className="hidden md:block">
                <div className="text-xs font-bold leading-tight truncate max-w-[110px]">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-tight">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div
                className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-fade-in ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-900'
                    : 'bg-[#0f172a] border-slate-800 text-slate-100 shadow-black/80'
                }`}
              >
                <div
                  className={`p-3.5 border-b ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Switch Active Staff Role
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                    Experience ERP features across Admin, Chef, Cashier, and Manager roles.
                  </p>
                </div>
                <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
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
                          ? 'bg-amber-500/15 border border-amber-500/40 text-white'
                          : 'hover:bg-slate-800/40 text-slate-300 hover:text-white'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{u.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.title}</div>
                        <span
                          className={`inline-block mt-0.5 text-[9px] px-1.5 py-0.2 rounded border font-semibold ${
                            roleBadges[u.role]?.bg
                          }`}
                        >
                          {roleBadges[u.role]?.label}
                        </span>
                      </div>
                      {currentUser.id === u.id && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Dropdown Logout Action */}
                <div
                  className={`p-2 border-t ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>{isLoggingOut ? 'Signing out...' : 'Sign Out / Return to Home'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick 1-Click Log Out Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600'
                : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-300 hover:text-white'
            }`}
            title="Log out and return to landing page"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">{isLoggingOut ? 'Leaving...' : 'Log Out'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
