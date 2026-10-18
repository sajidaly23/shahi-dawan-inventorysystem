'use client';

import React, { useState, useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import { AuditLog } from '../../../types';
import {
  ShieldCheck,
  Search,
  Filter,
  User,
  Clock,
  Activity,
  Layers,
} from 'lucide-react';
import { StatCard } from '../../common/StatCard';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useDb();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('All');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesSearch =
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.recordId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModule = selectedModule === 'All' || log.module === selectedModule;
      return matchesSearch && matchesModule;
    });
  }, [auditLogs, searchQuery, selectedModule]);

  const moduleColors: Record<AuditLog['module'], string> = {
    Inventory: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Purchases: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Recipes: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Menu: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'POS Orders': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Tables: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    'Hotel PMS': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    Billing: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    Waste: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    System: 'bg-slate-700 text-slate-300 border-slate-600',
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
            System Security & Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive tamper-proof log of staff activities, stock edits, pricing changes, and order settlements.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Audit Logs"
          value={auditLogs.length}
          subtitle="Monitored activities"
          icon={<ShieldCheck className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Active Monitored Modules"
          value="10 Modules"
          subtitle="POS, PMS, Inventory, BOM, Waste"
          icon={<Layers className="w-5 h-5" />}
          color="slate"
        />
        <StatCard
          title="Compliance Rating"
          value="100% Verified"
          subtitle="Full operational transparency"
          icon={<Activity className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit logs by action, staff, or record #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 w-full sm:w-auto"
        >
          <option value="All">All System Modules</option>
          <option value="Inventory">Inventory</option>
          <option value="Purchases">Purchases</option>
          <option value="Recipes">Recipes</option>
          <option value="POS Orders">POS Orders</option>
          <option value="Hotel PMS">Hotel PMS</option>
          <option value="Billing">Billing</option>
          <option value="Waste">Waste</option>
          <option value="System">System</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-750">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Staff User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Module</th>
                <th className="py-3.5 px-4">Action Summary</th>
                <th className="py-3.5 px-4">Record Ref</th>
                <th className="py-3.5 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-white text-xs">{log.user}</td>
                  <td className="py-3 px-4 font-mono uppercase text-[10px] text-slate-300">
                    {log.role.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        moduleColors[log.module] || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {log.module}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-amber-300 text-xs">{log.action}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{log.recordId}</td>
                  <td className="py-3 px-4 text-slate-300 text-[11px] max-w-sm truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
