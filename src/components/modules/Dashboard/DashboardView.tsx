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
      .filter((l) => l.type === 'Order Consumption')
      .forEach((entry) => {
        const current = map.get(entry.rawMaterialId) || {
          name: entry.itemName,
          unit: entry.unit,
          totalConsumed: 0,
        };
        current.totalConsumed += entry.quantity;
        map.set(entry.rawMaterialId, current);
      });
    return Array.from(map.values()).slice(0, 5);
  }, [stockLedger]);

  // Inventory Value Breakdown by Category
  const categoryValuations = useMemo(() => {
    const map = new Map<string, number>();
    rawMaterials.forEach((m) => {
      const displayQty = fromBaseUnitQuantity(m.currentQty, m.unit);
      const val = displayQty * m.purchasePrice;
      map.set(m.category, (map.get(m.category) || 0) + val);
    });
    return Array.from(map.entries()).map(([cat, val]) => ({ category: cat, value: Math.round(val) }));
  }, [rawMaterials]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-amber-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-700 border border-amber-300">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
                Live Operations Center
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-royal">
              Welcome to {settings.businessName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Real-time Recipe / BOM automatic ingredient consumption engine, raw materials inventory valuation, restaurant POS, and integrated hotel room billing.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('pos')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 transition transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>POS Terminal</span>
            </button>
            <button
              onClick={() => onNavigate('recipes')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition"
            >
              <ChefHat className="w-4 h-4" />
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
          subtitle={`${rawMaterials.length} inventory raw materials`}
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
          onClick={() => onNavigate('raw-materials')}
        />
        <StatCard
          title="Today's F&B Sales"
          value={`${settings.currencySymbol} ${todaySales.toLocaleString()}`}
          subtitle={`${todayOrders.length} restaurant orders placed`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="amber"
          onClick={() => onNavigate('pos')}
        />
        <StatCard
          title="Low & Out of Stock"
          value={`${lowStockItems.length + outOfStockItems.length} Items`}
          subtitle={`${outOfStockItems.length} zero stock, ${lowStockItems.length} low threshold`}
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
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Raw Materials Valuation by Category
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Capital allocation across food, meat, grain and dairy inventory
                </p>
              </div>
              <span className="text-xs font-mono font-extrabold text-emerald-700">
                {settings.currencySymbol} {Math.round(totalInventoryValue).toLocaleString()} Total
              </span>
            </div>

            {/* Custom Responsive Progress Bars */}
            <div className="space-y-3 pt-2">
              {categoryValuations.map((cat, idx) => {
                const pct = totalInventoryValue > 0 ? Math.round((cat.value / totalInventoryValue) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 font-semibold">{cat.category}</span>
                      <span className="text-slate-600 font-mono">
                        {settings.currencySymbol} {cat.value.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div
                        className="h-full rounded-full bg-amber-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top BOM Consumed Ingredients */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Top Consumed Ingredients (Recipe BOM)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Deducted automatically as customer orders were served
                </p>
              </div>
              <button
                onClick={() => onNavigate('stock-ledger')}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {consumptionAggregates.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <h5 className="text-xs font-bold text-slate-900">{item.name}</h5>
                    <span className="text-[10px] text-slate-500">Order Consumption</span>
                  </div>
                  <span className="font-mono font-extrabold text-amber-700 text-sm">
                    {item.totalConsumed.toFixed(2)} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Urgent Low Stock Alerts & Recent Activity Feed */}
        <div className="space-y-6">
          {/* Urgent Stock Alerts Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Stock Alerts ({lowStockItems.length + outOfStockItems.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('purchases')}
                className="text-[11px] text-amber-600 hover:underline font-bold"
              >
                + Reorder PO
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">All ingredients well stocked.</p>
              ) : (
                [...outOfStockItems, ...lowStockItems].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onNavigate('purchases')}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">{item.name}</h5>
                      <span className="text-[10px] text-slate-500">
                        Min: {item.minStockLevel} {item.unit}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        item.status === 'out_of_stock'
                          ? 'bg-rose-100 text-rose-700 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
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
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Waste Loss Summary
                </h3>
              </div>
              <button
                onClick={() => onNavigate('waste')}
                className="text-[11px] text-rose-600 hover:underline font-bold"
              >
                Log Waste
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <span className="text-xs text-rose-800 font-medium">Total Financial Waste Loss:</span>
              <span className="font-mono font-extrabold text-rose-600 text-sm">
                {settings.currencySymbol} {Math.round(totalWasteLoss).toLocaleString()}
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              {wasteRecords.length} recorded incidents across kitchen prep, spills, and spoilage.
            </p>
          </div>
        </div>
      </div>

      {/* RECENT ORDERS & RECENT PURCHASES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Restaurant Orders */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Recent Restaurant Orders
              </h3>
            </div>
            <button
              onClick={() => onNavigate('pos')}
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
            >
              Open POS
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">#{order.orderNumber}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {order.orderType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-extrabold text-amber-700 text-sm block">
                    {settings.currencySymbol} {order.grandTotal.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Stock In Purchases */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Recent Stock In Purchases
              </h3>
            </div>
            <button
              onClick={() => onNavigate('purchases')}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              View Purchases
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {purchases.slice(0, 4).map((po) => (
              <div key={po.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{po.invoiceNumber}</span>
                    <span className="text-slate-500 font-medium">({po.purchaseDate})</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{po.supplierName}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-extrabold text-emerald-700 text-sm block">
                    {settings.currencySymbol} {po.grandTotal.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">{po.items.length} items</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
