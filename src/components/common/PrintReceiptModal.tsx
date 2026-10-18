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
        <div className="bg-white text-black p-6 rounded-xl font-mono text-xs shadow-inner printable-area max-w-xs mx-auto border border-slate-300">
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
            <h2 className="text-base font-extrabold uppercase tracking-wider text-black">
              {settings.businessName}
            </h2>
            <p className="text-[11px] text-gray-700">{settings.tagline}</p>
            <p className="text-[10px] text-gray-600">{settings.address}</p>
            <p className="text-[10px] text-gray-600">Tel: {settings.phone}</p>
            {settings.gstNumber && (
              <p className="text-[10px] text-gray-600">GST: {settings.gstNumber}</p>
            )}
          </div>

          <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Ref:</span>
              <span className="font-bold text-black">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date/Time:</span>
              <span>{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Type:</span>
              <span className="font-bold uppercase">{order.orderType.replace('_', ' ')}</span>
            </div>
            {order.tableName && (
              <div className="flex justify-between">
                <span className="text-gray-600">Table:</span>
                <span className="font-bold">{order.tableName}</span>
              </div>
            )}
            {order.roomNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">Room / Guest:</span>
                <span className="font-bold">Room {order.roomNumber} ({order.customerName || 'Resident'})</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Server:</span>
              <span>{order.serverName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-gray-400">
            <div className="grid grid-cols-12 font-bold pb-1 text-[11px] border-b border-gray-300">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Total</span>
            </div>
            <div className="divide-y divide-gray-100 py-1 space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 pt-1 text-[11px]">
                  <div className="col-span-6">
                    <span className="font-semibold text-black">{item.name}</span>
                    {item.notes && <span className="block text-[9px] text-gray-500 italic">*{item.notes}</span>}
                  </div>
                  <span className="col-span-2 text-center">{item.quantity}</span>
                  <span className="col-span-4 text-right font-medium">
                    {settings.currencySymbol} {item.subtotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotals & Taxes */}
          <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{settings.currencySymbol} {order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-{settings.currencySymbol} {order.discount.toLocaleString()}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between">
                <span>GST Tax:</span>
                <span>{settings.currencySymbol} {order.tax.toLocaleString()}</span>
              </div>
            )}
            {order.serviceCharge > 0 && (
              <div className="flex justify-between">
                <span>Service Charge:</span>
                <span>{settings.currencySymbol} {order.serviceCharge.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-gray-300">
              <span>GRAND TOTAL:</span>
              <span>{settings.currencySymbol} {order.grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-bold uppercase text-black">{order.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-600">Status:</span>
              <span className="font-bold uppercase text-black">{order.paymentStatus.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="text-center pt-3 text-[10px] text-gray-600 space-y-0.5">
            <p className="font-semibold">*** Thank You For Dining With Us! ***</p>
            <p>Recipe BOM Ingredient Deduction Logged Automatically</p>
            <p className="text-[9px] text-gray-500">Software: Shahi Diwan Grand ERP</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition print-include"
          >
            <Printer className="w-4 h-4" /> Print Thermal Receipt (80mm)
          </button>
        </div>
      </div>
    </Modal>
  );
};
