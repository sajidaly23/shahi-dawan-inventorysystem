'use client';

import React, { useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import {
  Boxes,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  XCircle,
  Truck,
  Trash2,
  Building2,
  ChefHat,
  Flame,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { fromBaseUnitQuantity, smartFormatBaseQuantity } from '../../../utils/unitConverter';

interface DashboardViewProps {
  onNavigate: (tabId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    rawMaterials,
    orders,
    purchases,
    wasteRecords,
    stockLedger,
    rooms,
    hotelBills,
    settings,
  } = useDb();

  const isLight = settings?.theme === 'light';

  // Financial & Operational Metrics
  const totalInventoryValue = useMemo(() => {
    return rawMaterials.reduce((sum, item) => {
      const displayQty = fromBaseUnitQuantity(item.currentQty, item.unit);
      return sum + displayQty * item.purchasePrice;
    }, 0);
  }, [rawMaterials]);

  const todayOrders = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return orders.filter((o) => o.createdAt.startsWith(today) || o.status === 'completed');
  }, [orders]);

  const todaySales = useMemo(() => {
    return todayOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  }, [todayOrders]);

  const lowStockItems = rawMaterials.filter((m) => m.status === 'low_stock');
  const outOfStockItems = rawMaterials.filter((m) => m.status === 'out_of_stock');
  const totalWasteLoss = wasteRecords.reduce((sum, w) => sum + w.totalCostLoss, 0);

  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const occupancyPct = Math.round((occupiedRooms / rooms.length) * 100);

  // Top Consumed Ingredients by Weight
  const consumptionAggregates = useMemo(() => {
    const map = new Map<string, { name: string; unit: string; totalConsumed: number }>();
    stockLedger
      .filter((l) => l.type === 'Order Consumption' || l.type === 'CONSUMPTION')
      .forEach((entry) => {
        const current = map.get(entry.rawMaterialId) || {
          name: entry.itemName,
          unit: entry.unit,
          totalConsumed: 0,
        };
        current.totalConsumed += Math.abs(entry.quantity);
        map.set(entry.rawMaterialId, current);
      });
    return Array.from(map.values()).slice(0, 6);
  }, [stockLedger]);

  // Inventory Value Breakdown by Category
  const categoryValuations = useMemo(() => {
    const map = new Map<string, number>();
    rawMaterials.forEach((m) => {
      const displayQty = fromBaseUnitQuantity(m.currentQty, m.unit);
      const val = displayQty * m.purchasePrice;
      map.set(m.category, (map.get(m.category) || 0) + val);
    });
    return Array.from(map.entries())
      .map(([cat, val]) => ({ category: cat, value: Math.round(val) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [rawMaterials]);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl border transition-all ${
          isLight
            ? 'bg-white border-amber-200'
            : 'bg-[#0f172a]/95 border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 font-mono">
                Executive Operations Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-royal text-white">
              Welcome to {settings.businessName}
            </h1>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              Enterprise hospitality suite with real-time Recipe BOM ingredient consumption engine,
              multi-category inventory valuation, live kitchen KDS dispatch, and room folio billing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('pos')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl gold-gradient-bg text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 hover:brightness-110 transition transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950" />
              <span>Launch POS</span>
            </button>
            <button
              onClick={() => onNavigate('kds')}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs border transition cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-500/40'
              }`}
            >
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Kitchen Display</span>
            </button>
            <button
              onClick={() => onNavigate('recipes')}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs border transition cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-500/40'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span>BOM Recipes</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stock Value"
          value={`${settings.currencySymbol} ${Math.round(totalInventoryValue).toLocaleString()}`}
          subtitle={`${rawMaterials.length} raw materials held in store`}
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
          onClick={() => onNavigate('raw-materials')}
        />
        <StatCard
          title="Today's F&B Sales"
          value={`${settings.currencySymbol} ${todaySales.toLocaleString()}`}
          subtitle={`${todayOrders.length} dining & room orders`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="amber"
          onClick={() => onNavigate('pos')}
        />
        <StatCard
          title="Low & Out of Stock"
          value={`${lowStockItems.length + outOfStockItems.length} Items`}
          subtitle={`${outOfStockItems.length} zero stock, ${lowStockItems.length} below buffer`}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={outOfStockItems.length > 0 ? 'rose' : 'amber'}
          badge={outOfStockItems.length > 0 ? 'Urgent PO' : undefined}
          onClick={() => onNavigate('raw-materials')}
        />
        <StatCard
          title="Hotel Occupancy"
          value={`${occupancyPct}%`}
          subtitle={`${occupiedRooms} of ${rooms.length} suites occupied`}
          icon={<Building2 className="w-5 h-5" />}
          color="blue"
          onClick={() => onNavigate('hotel-pms')}
        />
      </div>

      {/* CHARTS & ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Category Valuation Breakdown & Top Consumed BOM Ingredients */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inventory Valuation by Category Chart */}
          <div
            className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl space-y-4 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-[#0f172a]/95 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={`text-sm font-extrabold uppercase tracking-wider ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Raw Materials Valuation by Category
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Capital allocation across food, meat, grain, dairy and spice inventory
                </p>
              </div>
              <span className="text-xs font-mono font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/30">
                {settings.currencySymbol} {Math.round(totalInventoryValue).toLocaleString()} Total
              </span>
            </div>

            {/* Custom Responsive Progress Bars */}
            <div className="space-y-3.5 pt-2">
              {categoryValuations.map((cat, idx) => {
                const pct = totalInventoryValue > 0 ? Math.round((cat.value / totalInventoryValue) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        {cat.category}
                      </span>
                      <span className={`font-mono ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {settings.currencySymbol} {cat.value.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div
                      className={`w-full h-2.5 rounded-full overflow-hidden border ${
                        isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-700 shadow-sm"
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top BOM Consumed Ingredients */}
          <div
            className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl space-y-4 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-[#0f172a]/95 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={`text-sm font-extrabold uppercase tracking-wider ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Top Consumed Ingredients (Recipe BOM)
                </h3>
                <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Deducted automatically as kitchen tickets were marked served
                </p>
              </div>
              <button
                onClick={() => onNavigate('stock-ledger')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Full Stock Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {consumptionAggregates.length === 0 ? (
                <div className="col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
                  <Activity className="w-6 h-6 text-amber-400 mx-auto mb-2 opacity-60" />
                  Order deductions will appear here as KDS kitchen tickets are completed.
                </div>
              ) : (
                consumptionAggregates.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition hover:border-amber-500/40 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0 pr-2">
                      <h5
                        className={`text-xs font-bold truncate ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {item.name}
                      </h5>
                      <span className="text-[10px] text-amber-400 font-medium">BOM Consumption</span>
                    </div>
                    <span className="font-mono font-extrabold text-amber-400 text-sm shrink-0">
                      {item.totalConsumed.toFixed(2)} {item.unit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Urgent Low Stock Alerts & Waste Summary */}
        <div className="space-y-6">
          {/* Urgent Stock Alerts Card */}
          <div
            className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl space-y-4 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-[#0f172a]/95 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3
                  className={`text-xs font-extrabold uppercase tracking-wider ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Stock Alerts ({lowStockItems.length + outOfStockItems.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('purchases')}
                className="text-[11px] text-amber-400 hover:underline font-bold cursor-pointer"
              >
                + Reorder PO
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
              {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs text-slate-300 font-semibold">All Ingredients Optimal</p>
                  <p className="text-[11px] text-slate-500">
                    Stock levels are securely above safety reorder points.
                  </p>
                </div>
              ) : (
                [...outOfStockItems, ...lowStockItems].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate('purchases')}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                      isLight
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <h5
                        className={`text-xs font-bold truncate ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}
                      >
                        {item.name}
                      </h5>
                      <span className="text-[10px] text-slate-400">
                        Min: {item.minStockLevel} {item.unit}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase shrink-0 border ${
                        item.status === 'out_of_stock'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {item.status === 'out_of_stock' ? '0 Available' : 'Low Stock'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Waste Summary Card */}
          <div
            className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl space-y-3.5 ${
              isLight
                ? 'bg-white border-slate-200'
                : 'bg-[#0f172a]/95 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-500" />
                <h3
                  className={`text-xs font-extrabold uppercase tracking-wider ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  Waste Loss Summary
                </h3>
              </div>
              <button
                onClick={() => onNavigate('waste')}
                className="text-[11px] text-rose-400 hover:underline font-bold cursor-pointer"
              >
                Log Waste
              </button>
            </div>

            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                isLight
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
              }`}
            >
              <span className="text-xs font-medium">Total Financial Waste:</span>
              <span className="font-mono font-extrabold text-rose-400 text-sm">
                {settings.currencySymbol} {Math.round(totalWasteLoss).toLocaleString()}
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              {wasteRecords.length} recorded incidents across prep, spill, and spoilage.
            </p>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS & RECENT PURCHASES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Restaurant Orders */}
        <div
          className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl space-y-4 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#0f172a]/95 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-500" />
              <h3
                className={`text-sm font-extrabold uppercase tracking-wider ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Recent Restaurant Orders
              </h3>
            </div>
            <button
              onClick={() => onNavigate('pos')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
            >
              Open POS
            </button>
          </div>

          <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/80'}`}>
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="py-3.5 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">#{order.orderNumber}</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-slate-800 text-amber-300 border border-slate-700">
                      {order.orderType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-extrabold text-amber-400 text-sm block">
                    {settings.currencySymbol} {order.grandTotal.toLocaleString()}
                  </span>
                  <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Stock In Purchases */}
        <div
          className={`p-6 rounded-3xl border shadow-xl backdrop-blur-xl space-y-4 ${
            isLight
              ? 'bg-white border-slate-200'
              : 'bg-[#0f172a]/95 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <h3
                className={`text-sm font-extrabold uppercase tracking-wider ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Recent Stock In Purchases
              </h3>
            </div>
            <button
              onClick={() => onNavigate('purchases')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              View Purchases
            </button>
          </div>

          <div className={`divide-y ${isLight ? 'divide-slate-100' : 'divide-slate-800/80'}`}>
            {purchases.slice(0, 4).map((po) => (
              <div key={po.id} className="py-3.5 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{po.invoiceNumber}</span>
                    <span className="text-slate-400 font-medium">({po.purchaseDate})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{po.supplierName}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-extrabold text-emerald-400 text-sm block">
                    {settings.currencySymbol} {po.grandTotal.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">{po.items.length} items received</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
