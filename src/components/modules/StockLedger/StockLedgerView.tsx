import React, { useState, useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import { InventoryTransactionType } from '../../../types';
import {
  History,
  Search,
  Filter,
  Download,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Trash2,
  Boxes,
  Truck,
  ShoppingBag,
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';
import { formatQuantityWithUnit } from '../../../utils/unitConverter';

export const StockLedgerView: React.FC = () => {
  const { stockLedger, settings } = useDb();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState('');

  const filteredEntries = useMemo(() => {
    return stockLedger.filter((entry) => {
      const matchesSearch =
        entry.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.user.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'All' || entry.type === selectedType;
      const matchesDate = !dateFilter || entry.date.startsWith(dateFilter);

      return matchesSearch && matchesType && matchesDate;
    });
  }, [stockLedger, searchQuery, selectedType, dateFilter]);

  const totalStockInEntries = stockLedger.filter((l) => l.type === 'Stock In').length;
  const totalOrderDeductions = stockLedger.filter((l) => l.type === 'Order Consumption').length;
  const totalWasteEntries = stockLedger.filter((l) => l.type === 'Waste').length;

  const handleExportCSV = () => {
    const headers = [
      'Date/Time',
      'Item Name',
      'SKU',
      'Transaction Type',
      'Quantity',
      'Unit',
      'Previous Balance',
      'New Balance',
      'Reference ID',
      'User / Author',
      'Financial Impact (Rs.)',
      'Notes',
    ];

    const rows = filteredEntries.map((e) => [
      `"${new Date(e.date).toLocaleString()}"`,
      `"${e.itemName}"`,
      `"${e.sku}"`,
      `"${e.type}"`,
      e.quantity,
      `"${e.unit}"`,
      e.previousBalance,
      e.newBalance,
      `"${e.referenceId}"`,
      `"${e.user}"`,
      e.costImpact || 0,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Stock_Ledger_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const typeStyles: Record<string, { bg: string; icon: React.ReactNode }> = {
    'Stock In': {
      bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />,
    },
    'STOCK IN': {
      bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />,
    },
    'Order Consumption': {
      bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />,
    },
    'SALE_CONSUMPTION': {
      bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />,
    },
    'CONSUMPTION': {
      bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: <ArrowDownRight className="w-3.5 h-3.5 text-amber-400" />,
    },
    Waste: {
      bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" />,
    },
    WASTE: {
      bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: <Trash2 className="w-3.5 h-3.5 text-rose-400" />,
    },
    Adjustment: {
      bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: <RefreshCw className="w-3.5 h-3.5 text-purple-400" />,
    },
    ADJUSTMENT: {
      bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: <RefreshCw className="w-3.5 h-3.5 text-purple-400" />,
    },
    Return: {
      bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      icon: <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />,
    },
    RETURN: {
      bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      icon: <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />,
    },
    Transfer: {
      bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      icon: <RefreshCw className="w-3.5 h-3.5 text-blue-400" />,
    },
    TRANSFER: {
      bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      icon: <RefreshCw className="w-3.5 h-3.5 text-blue-400" />,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
            Complete Stock Ledger Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable chronological record of every inventory movement (Stock In, Recipe Deductions, Waste, Adjustments).
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Ledger Records"
          value={stockLedger.length}
          subtitle="Audit movement transactions"
          icon={<History className="w-5 h-5" />}
          color="slate"
        />
        <StatCard
          title="Stock In Transactions"
          value={totalStockInEntries}
          subtitle="Shipments received"
          icon={<Truck className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Recipe Deductions"
          value={totalOrderDeductions}
          subtitle="BOM automatic order consumptions"
          icon={<ShoppingBag className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Waste Logs"
          value={totalWasteEntries}
          subtitle="Damaged / expired deductions"
          icon={<Trash2 className="w-5 h-5" />}
          color="rose"
        />
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by item, SKU, reference #, or staff..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Transaction Types</option>
            <option value="STOCK IN">STOCK IN / Purchases</option>
            <option value="CONSUMPTION">CONSUMPTION / POS Orders</option>
            <option value="WASTE">WASTE</option>
            <option value="ADJUSTMENT">ADJUSTMENT</option>
            <option value="RETURN">RETURN</option>
            <option value="TRANSFER">TRANSFER</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-750">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Item Name & SKU</th>
                <th className="py-3.5 px-4">Transaction Type</th>
                <th className="py-3.5 px-4 text-right">Quantity Change</th>
                <th className="py-3.5 px-4 text-right">Previous Bal.</th>
                <th className="py-3.5 px-4 text-right">New Balance</th>
                <th className="py-3.5 px-4">Reference #</th>
                <th className="py-3.5 px-4">Author / Staff</th>
                <th className="py-3.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No ledger records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const style = typeStyles[entry.type] || typeStyles['Adjustment'];
                  const isPositive = entry.baseQtyChange > 0;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition">
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(entry.date).toLocaleString()}
                      </td>

                      {/* Item */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs">{entry.itemName}</div>
                        <span className="font-mono text-[10px] text-slate-400">{entry.sku}</span>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${style.bg}`}
                        >
                          {style.icon}
                          <span>{entry.type}</span>
                        </span>
                      </td>

                      {/* Qty Change */}
                      <td
                        className={`py-3 px-4 text-right font-mono font-extrabold text-sm ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : '-'}
                        {formatQuantityWithUnit(entry.quantity, entry.unit)}
                      </td>

                      {/* Previous Balance */}
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {entry.previousBalance.toFixed(2)} {entry.unit}
                      </td>

                      {/* New Balance */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {entry.newBalance.toFixed(2)} {entry.unit}
                      </td>

                      {/* Reference */}
                      <td className="py-3 px-4 font-mono font-semibold text-amber-400 text-xs">
                        {entry.referenceId}
                      </td>

                      {/* User */}
                      <td className="py-3 px-4 text-slate-300 text-[11px]">{entry.user}</td>

                      {/* Notes */}
                      <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate" title={entry.notes}>
                        {entry.notes || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
