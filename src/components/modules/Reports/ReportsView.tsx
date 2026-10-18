'use client';

import React, { useState, useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Percent,
  ChefHat,
  Boxes,
  Building2,
  Trash2,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { fromBaseUnitQuantity } from '../../../utils/unitConverter';

type ReportTab =
  | 'sales'
  | 'consumption'
  | 'food_cost'
  | 'purchases'
  | 'waste'
  | 'hotel_occupancy';

export const ReportsView: React.FC = () => {
  const {
    orders,
    recipes,
    rawMaterials,
    purchases,
    wasteRecords,
    stockLedger,
    rooms,
    hotelBills,
    settings,
  } = useDb();

  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('sales');
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // 1. Sales Report Calculations
  const completedOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'completed');
  }, [orders]);

  const totalSalesRevenue = completedOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const avgOrderValue =
    completedOrders.length > 0 ? Math.round(totalSalesRevenue / completedOrders.length) : 0;

  // 2. Food Cost & Profitability Matrix
  const recipeRankings = useMemo(() => {
    return [...recipes].sort((a, b) => a.foodCostPercentage - b.foodCostPercentage);
  }, [recipes]);

  // 3. BOM Consumption Aggregates
  const bomConsumptionData = useMemo(() => {
    const map = new Map<
      string,
      { name: string; sku: string; unit: string; totalQty: number; totalCost: number }
    >();

    stockLedger
      .filter((l) => l.type === 'Order Consumption')
      .forEach((entry) => {
        const current = map.get(entry.rawMaterialId) || {
          name: entry.itemName,
          sku: entry.sku,
          unit: entry.unit,
          totalQty: 0,
          totalCost: 0,
        };
        current.totalQty += entry.quantity;
        current.totalCost += entry.costImpact || 0;
        map.set(entry.rawMaterialId, current);
      });

    return Array.from(map.values()).sort((a, b) => b.totalCost - a.totalCost);
  }, [stockLedger]);

  // 4. Hotel Revenue
  const totalHotelRevenue = useMemo(() => {
    return hotelBills.reduce((sum, b) => sum + b.grandTotal, 0);
  }, [hotelBills]);

  // CSV Export for active report
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `Report_${activeReportTab}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (activeReportTab === 'sales') {
      headers = ['Order Ref', 'Date/Time', 'Type', 'Table/Room', 'Customer', 'Items Count', 'Grand Total', 'Payment'];
      rows = completedOrders.map((o) => [
        `"${o.orderNumber}"`,
        `"${new Date(o.createdAt).toLocaleString()}"`,
        `"${o.orderType}"`,
        `"${o.tableName || o.roomNumber || 'Takeaway'}"`,
        `"${o.customerName}"`,
        o.items.length,
        o.grandTotal,
        `"${o.paymentMethod}"`,
      ]);
    } else if (activeReportTab === 'food_cost') {
      headers = ['Dish Name', 'Selling Price', 'BOM Food Cost', 'Gross Profit (Rs)', 'Food Cost %', 'Profit Margin %'];
      rows = recipes.map((r) => [
        `"${r.menuItemName}"`,
        r.sellingPrice,
        r.totalFoodCost,
        r.grossMarginRs,
        `${r.foodCostPercentage}%`,
        `${Math.round(((r.sellingPrice - r.totalFoodCost) / r.sellingPrice) * 100)}%`,
      ]);
    } else if (activeReportTab === 'consumption') {
      headers = ['Ingredient Name', 'SKU', 'Total Consumed', 'Unit', 'Financial Cost (Rs)'];
      rows = bomConsumptionData.map((c) => [
        `"${c.name}"`,
        `"${c.sku}"`,
        c.totalQty,
        `"${c.unit}"`,
        c.totalCost,
      ]);
    } else if (activeReportTab === 'waste') {
      headers = ['Record Ref', 'Date', 'Material', 'Quantity', 'Unit', 'Reason', 'Cost Loss (Rs)', 'Logged By'];
      rows = wasteRecords.map((w) => [
        `"${w.recordNumber}"`,
        `"${w.date}"`,
        `"${w.rawMaterialName}"`,
        w.quantity,
        `"${w.unit}"`,
        `"${w.reason}"`,
        w.totalCostLoss,
        `"${w.recordedBy}"`,
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
            Business Intelligence & Management Reports
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Analyze sales revenues, BOM food cost margins, ingredient depletion, waste losses, and hotel occupancy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition transform active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="F&B Sales Revenue"
          value={`${settings.currencySymbol} ${totalSalesRevenue.toLocaleString()}`}
          subtitle={`${completedOrders.length} fulfilled orders`}
          icon={<DollarSign className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Avg Order Ticket"
          value={`${settings.currencySymbol} ${avgOrderValue.toLocaleString()}`}
          subtitle="Average basket size"
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Hotel Folio Revenue"
          value={`${settings.currencySymbol} ${Math.round(totalHotelRevenue).toLocaleString()}`}
          subtitle="Room charges + room service"
          icon={<Building2 className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Waste Write-Offs"
          value={`${settings.currencySymbol} ${Math.round(wasteRecords.reduce((s, w) => s + w.totalCostLoss, 0)).toLocaleString()}`}
          subtitle="Total kitchen waste loss"
          icon={<Trash2 className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {/* Navigation Report Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeReportTab === 'sales'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Sales Analysis
        </button>

        <button
          onClick={() => setActiveReportTab('food_cost')}
          className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeReportTab === 'food_cost'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Percent className="w-4 h-4" /> Recipe Food Cost % & Margins
        </button>

        <button
          onClick={() => setActiveReportTab('consumption')}
          className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeReportTab === 'consumption'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4" /> BOM Ingredient Consumption
        </button>

        <button
          onClick={() => setActiveReportTab('waste')}
          className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeReportTab === 'waste'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Trash2 className="w-4 h-4" /> Waste & Loss Report
        </button>

        <button
          onClick={() => setActiveReportTab('purchases')}
          className={`px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-2 ${
            activeReportTab === 'purchases'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Supplier Procurement Spend
        </button>
      </div>

      {/* REPORT CONTENT BODY */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
        {/* 1. SALES REPORT */}
        {activeReportTab === 'sales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-750">
                <tr>
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Date / Time</th>
                  <th className="py-3.5 px-4">Order Type</th>
                  <th className="py-3.5 px-4">Table / Room</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4 text-center">Items Count</th>
                  <th className="py-3.5 px-4 text-right">Grand Total</th>
                  <th className="py-3.5 px-4 text-center">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {completedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-white">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold uppercase text-amber-300">
                      {o.orderType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-300">{o.tableName || (o.roomNumber ? `Room ${o.roomNumber}` : 'Takeaway')}</td>
                    <td className="py-3 px-4 text-slate-300">{o.customerName}</td>
                    <td className="py-3 px-4 text-center font-mono">{o.items.length}</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-amber-400 text-sm">
                      {settings.currencySymbol} {o.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold uppercase text-slate-300">
                      {o.paymentMethod.replace('_', ' ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. RECIPE FOOD COST & MARGIN REPORT */}
        {activeReportTab === 'food_cost' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-750">
                <tr>
                  <th className="py-3.5 px-4">Menu Dish Name</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-right">Calculated Food Cost</th>
                  <th className="py-3.5 px-4 text-right">Gross Profit Margin</th>
                  <th className="py-3.5 px-4 text-center">Food Cost %</th>
                  <th className="py-3.5 px-4 text-center">Profitability Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recipeRankings.map((r) => {
                  const isHealthy = r.foodCostPercentage <= 35;
                  const isModerate = r.foodCostPercentage > 35 && r.foodCostPercentage <= 50;

                  return (
                    <tr key={r.id} className="hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-white text-sm">{r.menuItemName}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                        {settings.currencySymbol} {r.sellingPrice.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                        {settings.currencySymbol} {r.totalFoodCost.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                        {settings.currencySymbol} {r.grossMarginRs.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-sm">
                        <span
                          className={
                            isHealthy
                              ? 'text-emerald-400'
                              : isModerate
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }
                        >
                          {r.foodCostPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            isHealthy
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isModerate
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {isHealthy ? 'High Margin' : isModerate ? 'Moderate' : 'High Food Cost Alert'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. BOM CONSUMPTION REPORT */}
        {activeReportTab === 'consumption' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-750">
                <tr>
                  <th className="py-3.5 px-4">Raw Material Ingredient</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4 text-right">Total Depleted By Orders</th>
                  <th className="py-3.5 px-4 text-right">Depleted Cost Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bomConsumptionData.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-white text-sm">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{c.sku}</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-amber-400 text-sm">
                      {c.totalQty.toFixed(2)} {c.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-400 text-sm">
                      {settings.currencySymbol} {c.totalCost.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. WASTE REPORT */}
        {activeReportTab === 'waste' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-750">
                <tr>
                  <th className="py-3.5 px-4">Ref #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Quantity Waste</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4 text-right">Financial Loss</th>
                  <th className="py-3.5 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {wasteRecords.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{w.recordNumber}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{new Date(w.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold text-white">{w.rawMaterialName}</td>
                    <td className="py-3 px-4 font-mono text-rose-400">
                      {w.quantity} {w.unit}
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold text-slate-300">{w.reason}</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-rose-400 text-sm">
                      {settings.currencySymbol} {w.totalCostLoss.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{w.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. PURCHASES REPORT */}
        {activeReportTab === 'purchases' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-750">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Purchase Date</th>
                  <th className="py-3.5 px-4">Wholesale Supplier</th>
                  <th className="py-3.5 px-4 text-center">Items Ingested</th>
                  <th className="py-3.5 px-4 text-right">Invoice Spend</th>
                  <th className="py-3.5 px-4 text-center">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-white">{p.invoiceNumber}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{p.purchaseDate}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{p.supplierName}</td>
                    <td className="py-3 px-4 text-center font-mono">{p.items.length}</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-400 text-sm">
                      {settings.currencySymbol} {p.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center uppercase font-bold text-amber-300">
                      {p.paymentStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
