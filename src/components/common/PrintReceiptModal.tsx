'use client';

import React from 'react';
import { RestaurantOrder } from '../../types';
import { useDb } from '../../context/DbContext';
import { Printer, X } from 'lucide-react';
import { Modal } from './Modal';

interface PrintReceiptModalProps {
  order: RestaurantOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({ order, isOpen, onClose }) => {
  const { settings } = useDb();

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Print Receipt: #${order.orderNumber}`}
      maxWidth="md"
      icon={<Printer className="w-5 h-5 text-amber-400" />}
    >
      <div className="space-y-4">
        {/* Printable Thermal Receipt (80mm styling) */}
        <div className="bg-[#070b14] text-white p-6 rounded-2xl font-mono text-xs shadow-2xl printable-area max-w-sm mx-auto border-2 border-slate-700/80">
          <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-slate-600">
            <h2 className="text-base font-black uppercase tracking-wider text-white">
              {settings.businessName}
            </h2>
            <p className="text-xs font-semibold text-amber-400">{settings.tagline}</p>
            <p className="text-[11px] text-slate-200 font-medium">{settings.address}</p>
            <p className="text-[11px] text-slate-200 font-medium">Tel: {settings.phone}</p>
            {settings.gstNumber && (
              <p className="text-[10px] text-slate-300">GST: {settings.gstNumber}</p>
            )}
          </div>

          <div className="py-3 border-b-2 border-dashed border-slate-600 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Order Ref:</span>
              <span className="font-black text-white">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Date/Time:</span>
              <span className="text-slate-100 font-medium">{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Type:</span>
              <span className="font-extrabold uppercase text-amber-400">{order.orderType.replace('_', ' ')}</span>
            </div>
            {order.tableName && (
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Table:</span>
                <span className="font-bold text-white">{order.tableName}</span>
              </div>
            )}
            {order.roomNumber && (
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">Room / Guest:</span>
                <span className="font-bold text-white">Room {order.roomNumber} ({order.customerName || 'Resident'})</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Server:</span>
              <span className="text-slate-100 font-semibold">{order.serverName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b-2 border-dashed border-slate-600">
            <div className="grid grid-cols-12 font-extrabold pb-1.5 text-xs border-b border-slate-700 text-amber-400">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Total</span>
            </div>
            <div className="divide-y divide-slate-800/80 py-1 space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 pt-1.5 text-xs items-center">
                  <div className="col-span-6">
                    <span className="font-bold text-white block leading-tight">{item.name}</span>
                    {item.notes && <span className="block text-[10px] text-slate-300 italic">*{item.notes}</span>}
                  </div>
                  <span className="col-span-2 text-center font-bold text-amber-300">{item.quantity}</span>
                  <span className="col-span-4 text-right font-black text-white font-mono">
                    {settings.currencySymbol} {item.subtotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotals & Taxes */}
          <div className="py-3 border-b-2 border-dashed border-slate-600 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-200">Subtotal:</span>
              <span className="font-bold text-white font-mono">{settings.currencySymbol} {order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Discount:</span>
                <span className="font-mono">-{settings.currencySymbol} {order.discount.toLocaleString()}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-200">GST Tax:</span>
                <span className="font-bold text-white font-mono">{settings.currencySymbol} {order.tax.toLocaleString()}</span>
              </div>
            )}
            {order.serviceCharge > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-200">Service Charge:</span>
                <span className="font-bold text-white font-mono">{settings.currencySymbol} {order.serviceCharge.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm font-black pt-2 border-t-2 border-dashed border-slate-500">
              <span className="text-white font-black tracking-wide">GRAND TOTAL:</span>
              <span className="font-black text-amber-400 text-base font-mono">{settings.currencySymbol} {order.grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs pt-1.5">
              <span className="text-slate-300 font-medium">Payment Method:</span>
              <span className="font-bold uppercase text-white font-mono">{order.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Status:</span>
              <span className="font-extrabold uppercase text-emerald-400 tracking-wider">{order.paymentStatus.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="text-center pt-3 text-[11px] text-slate-200 space-y-1">
            <p className="font-bold text-amber-300">*** Thank You For Dining With Us! ***</p>
            <p className="text-[10px] text-slate-300">Recipe BOM Ingredient Deduction Logged Automatically</p>
            <p className="text-[9px] text-slate-400 font-medium">Software: Shahi Diwan Grand ERP</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" /> Print Thermal Receipt (80mm)
          </button>
        </div>
      </div>
    </Modal>
  );
};
