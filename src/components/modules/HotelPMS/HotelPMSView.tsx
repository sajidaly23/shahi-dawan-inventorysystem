'use client';

import React, { useState } from 'react';
import { useDb } from '../../../context/DbContext';
import { Room, RoomType, RoomStatus, Reservation } from '../../../types';
import {
  Building2,
  Calendar,
  Users,
  Plus,
  CheckCircle2,
  Brush,
  Wrench,
  Search,
  BedDouble,
  DollarSign,
  ArrowRight,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { StatCard } from '../../common/StatCard';

interface HotelPMSViewProps {
  onNavigateToFolio: () => void;
}

export const HotelPMSView: React.FC<HotelPMSViewProps> = ({ onNavigateToFolio }) => {
  const {
    rooms,
    reservations,
    guests,
    createReservation,
    checkInReservation,
    checkOutReservation,
    updateRoomStatus,
    settings,
  } = useDb();

  const [selectedFloor, setSelectedFloor] = useState<number | 'All'>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  // Booking Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().slice(0, 10));
  const [nights, setNights] = useState<number>(2);
  const [advanceDeposit, setAdvanceDeposit] = useState<number>(10000);
  const [bookingNotes, setBookingNotes] = useState('');

  // Filtered Rooms
  const filteredRooms = rooms.filter((r) => {
    const matchesFloor = selectedFloor === 'All' || r.floor === selectedFloor;
    const matchesType = selectedType === 'All' || r.type === selectedType;
    return matchesFloor && matchesType;
  });

  const availableRoomsCount = rooms.filter((r) => r.status === 'available').length;
  const occupiedRoomsCount = rooms.filter((r) => r.status === 'occupied').length;
  const reservedRoomsCount = rooms.filter((r) => r.status === 'reserved').length;
  const cleaningRoomsCount = rooms.filter((r) => r.status === 'cleaning').length;

  const occupancyRate = Math.round((occupiedRoomsCount / rooms.length) * 100);

  const handleOpenBooking = (room: Room) => {
    setSelectedRoomForBooking(room);
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setCheckInDate(new Date().toISOString().slice(0, 10));
    setNights(2);
    setAdvanceDeposit(room.pricePerNight);
    setBookingNotes('');
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForBooking) return;

    const checkOut = new Date(new Date(checkInDate).getTime() + nights * 86400000)
      .toISOString()
      .slice(0, 10);

    createReservation({
      guestId: `gst-${Date.now()}`,
      guestName,
      guestPhone,
      guestEmail,
      roomId: selectedRoomForBooking.id,
      roomNumber: selectedRoomForBooking.roomNumber,
      roomType: selectedRoomForBooking.type,
      checkInDate,
      checkOutDate: checkOut,
      nights,
      pricePerNight: selectedRoomForBooking.pricePerNight,
      totalRoomCharges: selectedRoomForBooking.pricePerNight * nights,
      advanceDeposit,
      notes: bookingNotes,
    });

    setIsBookingModalOpen(false);
  };

  const statusStyles: Record<RoomStatus, { border: string; bg: string; badge: string; text: string }> = {
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
      text: 'Occupied',
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
      text: 'Housekeeping Cleaning',
    },
    maintenance: {
      border: 'border-rose-500/40 hover:border-rose-400',
      bg: 'bg-rose-500/5',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      text: 'Maintenance',
    },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
            Hotel PMS & Room Operations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time room status matrix, guest check-in/out workflows, and integrated dining bill posting to room folios.
          </p>
        </div>

        <button
          onClick={onNavigateToFolio}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition transform active:scale-95"
        >
          <span>Open Guest Folio Billing</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          subtitle={`${occupiedRoomsCount} of ${rooms.length} rooms occupied`}
          icon={<Building2 className="w-5 h-5" />}
          color="amber"
          badge="Live"
        />
        <StatCard
          title="Available Clean Rooms"
          value={availableRoomsCount}
          subtitle="Ready for walk-in check-in"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Reserved Rooms"
          value={reservedRoomsCount}
          subtitle="Awaiting guest arrivals"
          icon={<Calendar className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Housekeeping Required"
          value={cleaningRoomsCount}
          subtitle="Dirty rooms pending turnover"
          icon={<Brush className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Floor & Room Type Filters */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 font-bold uppercase text-[10px] mr-2">Floor:</span>
          {[('All' as const), 1, 2, 3].map((fl) => (
            <button
              key={fl}
              onClick={() => setSelectedFloor(fl)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedFloor === fl
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {fl === 'All' ? 'All Floors' : `Floor ${fl}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Room Types</option>
            <option value="Standard Double">Standard Double</option>
            <option value="Deluxe Room">Deluxe Room</option>
            <option value="Executive Suite">Executive Suite</option>
            <option value="Royal Presidential Suite">Royal Presidential Suite</option>
            <option value="Family Penthouse">Family Penthouse</option>
          </select>
        </div>
      </div>

      {/* Room Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const style = statusStyles[room.status];
          const activeRes = reservations.find((r) => r.id === room.currentReservationId);

          return (
            <div
              key={room.id}
              className={`rounded-2xl bg-slate-900 border ${style.border} ${style.bg} p-5 shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 group`}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-xl text-white group-hover:text-amber-400 transition">
                        Room {room.roomNumber}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-300/90 block mt-0.5">{room.type}</span>
                    <span className="text-[11px] text-slate-400">Floor {room.floor} • Capacity: {room.capacity} Guests</span>
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase border ${style.badge}`}>
                    {style.text}
                  </span>
                </div>
              </div>

              {/* Price & Amenities */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Rate / Night:</span>
                  <span className="font-mono font-extrabold text-white text-sm">
                    {settings.currencySymbol} {room.pricePerNight.toLocaleString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {room.amenities.slice(0, 3).map((a, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Resident or Reservation Details */}
              {room.status === 'occupied' && activeRes && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resident:</span>
                    <strong className="text-white">{activeRes.guestName}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Depart:</span>
                    <span className="font-mono text-amber-300">{activeRes.checkOutDate}</span>
                  </div>
                </div>
              )}

              {room.status === 'reserved' && activeRes && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reserved For:</span>
                    <strong className="text-purple-300">{activeRes.guestName}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Arrive:</span>
                    <span className="font-mono text-white">{activeRes.checkInDate} ({activeRes.nights}N)</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                {room.status === 'available' && (
                  <button
                    onClick={() => handleOpenBooking(room)}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" /> Book / Check-In
                  </button>
                )}

                {room.status === 'reserved' && activeRes && (
                  <button
                    onClick={() => checkInReservation(activeRes.id)}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Check-In Guest
                  </button>
                )}

                {room.status === 'occupied' && activeRes && (
                  <button
                    onClick={() => onNavigateToFolio()}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-amber-500/40 transition flex items-center justify-center gap-1.5"
                  >
                    <span>View Bill & Checkout</span>
                  </button>
                )}

                {room.status === 'cleaning' && (
                  <button
                    onClick={() => updateRoomStatus(room.id, 'available')}
                    className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <Brush className="w-3.5 h-3.5" /> Cleaned & Available
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* BOOKING MODAL */}
      {selectedRoomForBooking && (
        <Modal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          title={`Book Room ${selectedRoomForBooking.roomNumber}`}
          subtitle={`${selectedRoomForBooking.type} — ${settings.currencySymbol} ${selectedRoomForBooking.pricePerNight.toLocaleString()} / night`}
          maxWidth="md"
          icon={<Building2 className="w-5 h-5 text-amber-400" />}
        >
          <form onSubmit={handleConfirmBooking} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Guest Full Name
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Major General Tariq Khan"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="e.g. +92 300 9988776"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="guest@domain.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Check-In Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Duration (Nights)
                </label>
                <input
                  type="number"
                  min="1"
                  value={nights}
                  onChange={(e) => setNights(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Advance Deposit ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={advanceDeposit}
                onChange={(e) => setAdvanceDeposit(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex justify-between">
              <span className="text-slate-400">Total Room Charges:</span>
              <strong className="text-white font-mono">
                {settings.currencySymbol} {(selectedRoomForBooking.pricePerNight * nights).toLocaleString()}
              </strong>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition"
              >
                Confirm Room Reservation
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
