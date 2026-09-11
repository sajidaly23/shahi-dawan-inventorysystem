import React, { useState } from 'react';
import { useDb } from '../../../context/DbContext';
import { HotelBill, FolioItem } from '../../../types';
import {
  Receipt,
  Plus,
  Printer,
  CheckCircle2,
  UtensilsCrossed,
  BedDouble,
  Shirt,
  DollarSign,
  Search,
  Building2,
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { StatCard } from '../../common/StatCard';
import { PrintInvoiceModal } from '../../common/PrintInvoiceModal';

export const FolioBillingView: React.FC = () => {
  const {
    hotelBills,
    checkOutReservation,
    addFolioCharge,
    settings,
    currentUser,
  } = useDb();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'open' | 'settled' | 'All'>('open');
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<HotelBill | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Add Custom Charge Modal
  const [isAddChargeModalOpen, setIsAddChargeModalOpen] = useState(false);
  const [targetBillId, setTargetBillId] = useState<string>('');
  const [chargeType, setChargeType] = useState<FolioItem['type']>('laundry');
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState<number>(1000);
  const [chargeQty, setChargeQty] = useState<number>(1);

  // Filtered Bills
  const filteredBills = hotelBills.filter((b) => {
    const matchesSearch =
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || b.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalOpenBalance = hotelBills
    .filter((b) => b.status === 'open')
    .reduce((sum, b) => sum + b.balanceDue, 0);

  const totalRestaurantChargesAttached = hotelBills.reduce(
    (sum, b) => sum + b.restaurantChargesSubtotal,
    0
  );

  const handleOpenAddCharge = (bill: HotelBill) => {
    setTargetBillId(bill.id);
    setChargeType('laundry');
    setChargeDesc('Dry Cleaning & Pressing Service');
    setChargeAmount(850);
    setChargeQty(1);
    setIsAddChargeModalOpen(true);
  };

  const handleSaveCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBillId) return;

    addFolioCharge(targetBillId, {
      date: new Date().toISOString(),
      type: chargeType,
      description: chargeDesc,
      quantity: chargeQty,
      unitPrice: chargeAmount,
      totalAmount: chargeAmount * chargeQty,
    });

    setIsAddChargeModalOpen(false);
  };

  const handleSettleAndCheckout = (bill: HotelBill) => {
    if (
      window.confirm(
        `Confirm checkout for guest ${bill.guestName} (Room ${bill.roomNumber})? Total settlement: Rs. ${bill.balanceDue.toLocaleString()}`
      )
    ) {
      checkOutReservation(bill.reservationId, 'cash');
    }
  };

  const handleOpenInvoicePrint = (bill: HotelBill) => {
    setSelectedBillForPrint(bill);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
            Hotel + Restaurant Integrated Folio Billing
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Seamlessly post POS restaurant food orders to hotel guest room numbers. Consolidated master invoices at checkout.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Open Room Folios"
          value={hotelBills.filter((b) => b.status === 'open').length}
          subtitle="Currently checked-in guest folios"
          icon={<Building2 className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Pending Folio Balance Due"
          value={`${settings.currencySymbol} ${Math.round(totalOpenBalance).toLocaleString()}`}
          subtitle="Receivable at guest checkout"
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="F&B Billed to Rooms"
          value={`${settings.currencySymbol} ${Math.round(totalRestaurantChargesAttached).toLocaleString()}`}
          subtitle="POS orders charged to rooms"
          icon={<UtensilsCrossed className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by guest name or room number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedStatus('open')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedStatus === 'open'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Open Active Folios
          </button>
          <button
            onClick={() => setSelectedStatus('settled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedStatus === 'settled'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Settled Invoices
          </button>
          <button
            onClick={() => setSelectedStatus('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedStatus === 'All'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Folios List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredBills.map((bill) => {
          const isOpen = bill.status === 'open';

          return (
            <div
              key={bill.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 shadow-xl space-y-4 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-extrabold text-xl text-white">
                      Room {bill.roomNumber}
                    </h3>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase border ${
                        isOpen
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {bill.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-200 mt-0.5">{bill.guestName}</h4>
                  <p className="text-xs text-slate-400">
                    {bill.roomType} • {bill.nights} Nights ({bill.checkInDate} to {bill.checkOutDate})
                  </p>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isOpen ? 'Balance Due' : 'Total Settled'}
                  </span>
                  <span className="text-lg font-extrabold text-amber-400">
                    {settings.currencySymbol}{' '}
                    {isOpen ? bill.balanceDue.toLocaleString() : bill.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Itemized Folio Items List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  <span>Folio Charges ({bill.items.length} Transactions)</span>
                  <span>Amount</span>
                </div>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950/40 max-h-48 overflow-y-auto">
                  {bill.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-3 py-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {item.type === 'room_charge' && (
                          <BedDouble className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        )}
                        {item.type === 'restaurant_order' && (
                          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        )}
                        {item.type === 'laundry' && (
                          <Shirt className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        )}
                        <span className="text-slate-200 truncate">{item.description}</span>
                      </div>
                      <span className="font-mono font-semibold text-slate-300 shrink-0 pl-2">
                        {settings.currencySymbol} {item.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown Strip */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-750 text-center text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Room</span>
                  <span className="font-mono font-bold text-white">
                    {settings.currencySymbol} {bill.roomChargesSubtotal.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Restaurant</span>
                  <span className="font-mono font-bold text-amber-400">
                    {settings.currencySymbol} {bill.restaurantChargesSubtotal.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Deposit Paid</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {settings.currencySymbol} {bill.advancePaid.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenInvoicePrint(bill)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  <span>Official Folio Print</span>
                </button>

                {isOpen && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenAddCharge(bill)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-amber-500/30 transition"
                    >
                      + Add Charge
                    </button>
                    <button
                      onClick={() => handleSettleAndCheckout(bill)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                    >
                      Checkout & Settle
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD CHARGE MODAL */}
      <Modal
        isOpen={isAddChargeModalOpen}
        onClose={() => setIsAddChargeModalOpen(false)}
        title="Add Service Charge to Guest Folio"
        subtitle="Post laundry, spa, mini-bar or airport transport charges"
        maxWidth="md"
        icon={<Plus className="w-5 h-5 text-amber-400" />}
      >
        <form onSubmit={handleSaveCharge} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Service Category
            </label>
            <select
              value={chargeType}
              onChange={(e) => setChargeType(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="laundry">Laundry & Dry Cleaning</option>
              <option value="room_service">Room Service / Extra Amenities</option>
              <option value="spa">Spa & Wellness</option>
              <option value="other">Airport Transfer / Car Rental</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Charge Description
            </label>
            <input
              type="text"
              value={chargeDesc}
              onChange={(e) => setChargeDesc(e.target.value)}
              placeholder="e.g. VIP Airport Limousine Drop-off"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={chargeQty}
                onChange={(e) => setChargeQty(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Unit Amount ({settings.currencySymbol})
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddChargeModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition"
            >
              Add to Guest Folio
            </button>
          </div>
        </form>
      </Modal>

      {/* PRINT FOLIO INVOICE MODAL */}
      <PrintInvoiceModal
        bill={selectedBillForPrint}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};
