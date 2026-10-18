'use client';

import React, { useState } from 'react';
import { useDb } from '../../../context/DbContext';
import { RestaurantTable, TableStatus } from '../../../types';
import {
  Table as TableIcon,
  Users,
  Clock,
  Plus,
  ShoppingBag,
  Calendar,
  CheckCircle2,
  Brush,
  Sparkles,
  Flame,
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { StatCard } from '../../common/StatCard';

interface TablesViewProps {
  onNavigateToPos: (tableId?: string) => void;
}

export const TablesView: React.FC<TablesViewProps> = ({ onNavigateToPos }) => {
  const { tables, updateTableStatus, reserveTable, settings } = useDb();

  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [selectedTableForReserve, setSelectedTableForReserve] = useState<RestaurantTable | null>(null);

  // Reservation Form
  const [resGuestName, setResGuestName] = useState('');
  const [resGuestPhone, setResGuestPhone] = useState('');
  const [resTime, setResTime] = useState('21:00');
  const [resPartySize, setResPartySize] = useState<number>(4);

  const zones = ['All', 'Main Dining Hall', 'Rooftop Terrace', 'Family VIP Area', 'Garden Lounge'];

  const filteredTables = tables.filter(
    (t) => selectedZone === 'All' || t.zone === selectedZone
  );

  const availableCount = tables.filter((t) => t.status === 'available').length;
  const occupiedCount = tables.filter((t) => t.status === 'occupied').length;
  const reservedCount = tables.filter((t) => t.status === 'reserved').length;
  const cleaningCount = tables.filter((t) => t.status === 'cleaning').length;

  const handleOpenReserve = (table: RestaurantTable) => {
    setSelectedTableForReserve(table);
    setResGuestName('');
    setResGuestPhone('');
    setResTime('21:00');
    setResPartySize(table.capacity);
    setIsReserveModalOpen(true);
  };

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableForReserve) return;

    reserveTable(selectedTableForReserve.id, {
      guestName: resGuestName,
      guestPhone: resGuestPhone,
      reservationTime: resTime,
      partySize: resPartySize,
    });

    setIsReserveModalOpen(false);
  };

  const statusColors: Record<TableStatus, { border: string; bg: string; badge: string; text: string }> = {
    available: {
      border: 'border-emerald-500/40 hover:border-emerald-400',
      bg: 'bg-emerald-500/5',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      text: 'Available',
    },
    occupied: {
      border: 'border-amber-500/40 hover:border-amber-400',
      bg: 'bg-amber-500/5',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      text: 'Occupied / Dining',
    },
    reserved: {
      border: 'border-purple-500/40 hover:border-purple-400',
      bg: 'bg-purple-500/5',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      text: 'Reserved',
    },
    cleaning: {
      border: 'border-sky-500/40 hover:border-sky-400',
      bg: 'bg-sky-500/5',
      badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      text: 'Cleaning / Readying',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
            Restaurant Floor Plan & Dining Tables
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time table occupancy, diner service status, table reservations, and 1-click POS terminal linkage.
          </p>
        </div>

        <button
          onClick={() => onNavigateToPos()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition transform active:scale-95"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Launch POS for Table</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Available Tables"
          value={availableCount}
          subtitle="Ready for seating"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Active Dining Tables"
          value={occupiedCount}
          subtitle="Current active orders"
          icon={<Flame className="w-5 h-5" />}
          color="amber"
          badge={occupiedCount > 0 ? `${occupiedCount} Live` : undefined}
        />
        <StatCard
          title="Reserved Tables"
          value={reservedCount}
          subtitle="Pre-booked for guests"
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Housekeeping Cleaning"
          value={cleaningCount}
          subtitle="Table sanitization in progress"
          icon={<Brush className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Zone Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {zones.map((z) => (
          <button
            key={z}
            onClick={() => setSelectedZone(z)}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition ${
              selectedZone === z
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {z} ({tables.filter((t) => z === 'All' || t.zone === z).length})
          </button>
        ))}
      </div>

      {/* Tables Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          const style = statusColors[table.status];

          return (
            <div
              key={table.id}
              className={`rounded-2xl bg-slate-900 border ${style.border} ${style.bg} p-5 shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 group`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-lg text-white group-hover:text-amber-400 transition">
                      {table.tableNumber}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${style.badge}`}>
                      {style.text}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{table.zone}</p>
                </div>

                <div className="flex items-center gap-1 text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>{table.capacity} Pax</span>
                </div>
              </div>

              {/* Status Details */}
              {table.status === 'occupied' && (
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Current Order Total:</span>
                    <span className="font-mono font-extrabold text-amber-400 text-sm">
                      {settings.currencySymbol} {(table.currentOrderTotal || 0).toLocaleString()}
                    </span>
                  </div>
                  {table.occupiedSince && (
                    <div className="flex justify-between items-center text-[11px] text-slate-400">
                      <span>Dining Duration:</span>
                      <span className="font-mono text-slate-300">
                        {Math.floor((Date.now() - new Date(table.occupiedSince).getTime()) / 60000)} mins
                      </span>
                    </div>
                  )}
                </div>
              )}

              {table.status === 'reserved' && table.reservationInfo && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Guest:</span>
                    <strong className="text-purple-300">{table.reservationInfo.guestName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time:</span>
                    <span className="font-mono text-white">{table.reservationInfo.reservationTime} ({table.reservationInfo.partySize} guests)</span>
                  </div>
                </div>
              )}

              {table.status === 'cleaning' && (
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200 flex items-center justify-between">
                  <span>Sanitization required</span>
                  <button
                    onClick={() => updateTableStatus(table.id, 'available')}
                    className="px-2 py-1 rounded bg-sky-500 text-slate-950 font-bold text-[10px] uppercase"
                  >
                    Mark Clean
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                {table.status === 'available' && (
                  <>
                    <button
                      onClick={() => onNavigateToPos(table.id)}
                      className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                    >
                      Seat & Order
                    </button>
                    <button
                      onClick={() => handleOpenReserve(table)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition"
                    >
                      Reserve
                    </button>
                  </>
                )}

                {table.status === 'occupied' && (
                  <button
                    onClick={() => onNavigateToPos(table.id)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-amber-500/40 transition"
                  >
                    Open Active Table Bill
                  </button>
                )}

                {table.status === 'reserved' && (
                  <button
                    onClick={() => updateTableStatus(table.id, 'occupied')}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
                  >
                    Seat Reserved Guests
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* TABLE RESERVATION MODAL */}
      {selectedTableForReserve && (
        <Modal
          isOpen={isReserveModalOpen}
          onClose={() => setIsReserveModalOpen(false)}
          title={`Reserve Table ${selectedTableForReserve.tableNumber}`}
          subtitle={`${selectedTableForReserve.name} (${selectedTableForReserve.zone}) — Capacity: ${selectedTableForReserve.capacity} Guests`}
          maxWidth="md"
          icon={<Calendar className="w-5 h-5 text-purple-400" />}
        >
          <form onSubmit={handleConfirmReservation} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Guest Full Name
              </label>
              <input
                type="text"
                value={resGuestName}
                onChange={(e) => setResGuestName(e.target.value)}
                placeholder="e.g. Barrister Ahmed Ali"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={resGuestPhone}
                onChange={(e) => setResGuestPhone(e.target.value)}
                placeholder="e.g. +92 300 1234567"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Reservation Time
                </label>
                <input
                  type="time"
                  value={resTime}
                  onChange={(e) => setResTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Party Size (Guests)
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedTableForReserve.capacity}
                  value={resPartySize}
                  onChange={(e) => setResPartySize(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsReserveModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950 transition"
              >
                Confirm Table Reservation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
