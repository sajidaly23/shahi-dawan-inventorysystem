'use client';

import React from 'react';
import { HotelBill } from '../../types';
import { useDb } from '../../context/DbContext';
import { Printer, Building2 } from 'lucide-react';
import { Modal } from './Modal';

interface PrintInvoiceModalProps {
  bill: HotelBill | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({ bill, isOpen, onClose }) => {
  const { settings } = useDb();

  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Guest Folio Invoice: Room ${bill.roomNumber}`}
      maxWidth="3xl"
      icon={<Building2 className="w-5 h-5 text-amber-400" />}
    >
      <div className="space-y-6">
        {/* Printable Master Invoice */}
        <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl printable-area border border-slate-200">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-lg font-royal">
                  S
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 font-royal">
                  {settings.businessName}
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">{settings.tagline}</p>
              <p className="text-xs text-slate-600 mt-1 max-w-sm">{settings.address}</p>
              <p className="text-xs text-slate-600">Tel: {settings.phone} | Email: {settings.email}</p>
              <p className="text-xs text-slate-600">GST Reg: {settings.gstNumber} | NTN: {settings.ntnNumber}</p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 rounded-md bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
                Master Guest Folio Invoice
              </div>
              <p className="text-sm font-extrabold text-slate-900 font-mono">Invoice #{bill.id.toUpperCase()}</p>
              <p className="text-xs text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-xs text-slate-500">Status: <span className="font-bold uppercase text-emerald-700">{bill.status}</span></p>
            </div>
          </div>

          {/* Guest & Stay Information */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Guest Name</span>
              <span className="font-bold text-slate-900 text-sm">{bill.guestName}</span>
              <span className="text-slate-600 block">{bill.guestPhone}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Room Accommodation</span>
              <span className="font-bold text-slate-900 text-sm">Room {bill.roomNumber}</span>
              <span className="text-slate-600 block">{bill.roomType}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Check-In Date</span>
              <span className="font-semibold text-slate-900">{bill.checkInDate}</span>
              <span className="text-slate-500 block">Stay Duration: {bill.nights} Nights</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Check-Out Date</span>
              <span className="font-semibold text-slate-900">{bill.checkOutDate}</span>
              <span className="text-slate-500 block">Settled By: {bill.settledBy || 'Front Desk'}</span>
            </div>
          </div>

          {/* Itemized Folio Table */}
          <div className="py-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
              Itemized Folio Transactions & Dining Charges
            </h4>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Total ({settings.currencySymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {bill.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.type === 'restaurant_order' ? 'bg-amber-100 text-amber-800' :
                        item.type === 'room_charge' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {item.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">{item.description}</td>
                    <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{item.unitPrice.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">
                      {item.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotals & Balances */}
          <div className="border-t-2 border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-2 text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-900 uppercase">Payment & Settlement Notes</h5>
              <p>• All restaurant food & beverage charges verified with kitchen BOM consumption ledger.</p>
              <p>• Room charges include luxury amenities, housekeeping and daily high-speed Wi-Fi.</p>
              <p>• Payment Received via: <span className="font-bold uppercase text-slate-900">{bill.paymentMethod || 'Cash / Credit'}</span></p>
            </div>

            <div className="space-y-2 text-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Room Accommodation Subtotal:</span>
                <span className="font-semibold font-mono">{settings.currencySymbol} {bill.roomChargesSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">Restaurant & Dining Charges:</span>
                <span className="font-semibold font-mono">{settings.currencySymbol} {bill.restaurantChargesSubtotal.toLocaleString()}</span>
              </div>
              {bill.otherChargesSubtotal > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600">Laundry & Other Services:</span>
                  <span className="font-semibold font-mono">{settings.currencySymbol} {bill.otherChargesSubtotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-1 font-bold text-slate-900 border-b border-slate-300">
                <span>Net Subtotal:</span>
                <span className="font-mono">{settings.currencySymbol} {bill.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-600">GST Taxes ({settings.defaultTaxRate}%):</span>
                <span className="font-mono">{settings.currencySymbol} {bill.taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 text-emerald-700 border-b border-slate-200">
                <span>Less Advance Deposit:</span>
                <span className="font-mono">-{settings.currencySymbol} {bill.advancePaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 text-base font-black text-slate-900 bg-amber-50 px-3 rounded-lg border border-amber-200">
                <span>{bill.status === 'settled' ? 'TOTAL PAID AMOUNT:' : 'NET BALANCE DUE:'}</span>
                <span className="font-mono text-amber-900">
                  {settings.currencySymbol} {bill.status === 'settled' ? bill.grandTotal.toLocaleString() : bill.balanceDue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-10 mt-6 border-t border-slate-300 text-xs text-center text-slate-600">
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-1"></div>
              <span>Guest Signature</span>
            </div>
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-1"></div>
              <span>Authorized Duty Manager</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
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
            <Printer className="w-4 h-4" /> Print Official Folio Invoice
          </button>
        </div>
      </div>
    </Modal>
  );
};
