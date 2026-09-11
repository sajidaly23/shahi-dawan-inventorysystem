import React, { useState, useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import { PurchaseInvoice, PurchaseItem, UnitType } from '../../../types';
import {
  Truck,
  Plus,
  Search,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle2,
  Trash2,
  Boxes,
  ArrowRight,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { StatCard } from '../../common/StatCard';
import { getCompatibleUnits, UNIT_DEFINITIONS, formatQuantityWithUnit } from '../../../utils/unitConverter';

export const PurchasesView: React.FC = () => {
  const {
    purchases,
    suppliers,
    rawMaterials,
    rawMaterialsMap,
    createPurchaseInvoice,
    settings,
    currentUser,
  } = useDb();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form State for New Purchase Receipt
  const [formInvoiceNo, setFormInvoiceNo] = useState('');
  const [formSupplierId, setFormSupplierId] = useState(suppliers[0]?.id || '');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formPaymentStatus, setFormPaymentStatus] = useState<PurchaseInvoice['paymentStatus']>('paid');
  const [formPaymentMethod, setFormPaymentMethod] = useState<PurchaseInvoice['paymentMethod']>('bank_transfer');
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState<
    Array<{
      rawMaterialId: string;
      quantity: number;
      unit: UnitType;
      unitCost: number;
      batchNumber?: string;
      expiryDate?: string;
    }>
  >([]);

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      return (
        p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.items.some((i) => i.rawMaterialName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [purchases, searchQuery]);

  // Financial Stats
  const totalPurchasesAmount = useMemo(() => {
    return purchases.reduce((acc, p) => acc + p.grandTotal, 0);
  }, [purchases]);

  const subtotalLive = useMemo(() => {
    return formItems.reduce((acc, i) => acc + (i.quantity * i.unitCost || 0), 0);
  }, [formItems]);

  const grandTotalLive = Math.max(0, subtotalLive - formDiscount);

  const handleOpenCreateModal = () => {
    const defaultSup = suppliers[0];
    const timestamp = Date.now().toString().slice(-4);
    setFormInvoiceNo(`INV-${new Date().getFullYear()}-${timestamp}`);
    setFormSupplierId(defaultSup ? defaultSup.id : '');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormPaymentStatus('paid');
    setFormPaymentMethod('bank_transfer');
    setFormDiscount(0);
    setFormNotes('');
    setFormItems([
      {
        rawMaterialId: rawMaterials[0]?.id || '',
        quantity: 50,
        unit: rawMaterials[0]?.unit || 'KG',
        unitCost: rawMaterials[0]?.purchasePrice || 300,
        batchNumber: `BCH-${timestamp}`,
      },
    ]);
    setIsCreateModalOpen(true);
  };

  const handleAddItemRow = () => {
    const first = rawMaterials[0];
    if (first) {
      setFormItems((prev) => [
        ...prev,
        {
          rawMaterialId: first.id,
          quantity: 20,
          unit: first.unit,
          unitCost: first.purchasePrice,
          batchNumber: `BCH-${Date.now().toString().slice(-4)}`,
        },
      ]);
    }
  };

  const handleUpdateItemRow = (
    index: number,
    field: 'rawMaterialId' | 'quantity' | 'unit' | 'unitCost' | 'batchNumber' | 'expiryDate',
    val: any
  ) => {
    setFormItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };

      if (field === 'rawMaterialId') {
        item.rawMaterialId = val;
        const mat = rawMaterialsMap.get(val);
        if (mat) {
          item.unit = mat.unit;
          item.unitCost = mat.purchasePrice;
        }
      } else if (field === 'quantity') {
        item.quantity = parseFloat(val) || 0;
      } else if (field === 'unit') {
        item.unit = val;
      } else if (field === 'unitCost') {
        item.unitCost = parseFloat(val) || 0;
      } else if (field === 'batchNumber') {
        item.batchNumber = val;
      } else if (field === 'expiryDate') {
        item.expiryDate = val;
      }

      copy[index] = item;
      return copy;
    });
  };

  const handleRemoveItemRow = (index: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (formItems.length === 0) {
      alert('Please add at least one item to receive into stock.');
      return;
    }

    const supplier = suppliers.find((s) => s.id === formSupplierId);
    const invoiceItems: PurchaseItem[] = formItems.map((item) => {
      const mat = rawMaterialsMap.get(item.rawMaterialId);
      const totalCost = item.quantity * item.unitCost;
      return {
        rawMaterialId: item.rawMaterialId,
        rawMaterialName: mat ? mat.name : 'Unknown',
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        totalCost,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
      };
    });

    createPurchaseInvoice({
      invoiceNumber: formInvoiceNo,
      supplierId: formSupplierId,
      supplierName: supplier ? supplier.name : 'General Supplier',
      purchaseDate: formDate,
      items: invoiceItems,
      subtotal: subtotalLive,
      tax: 0,
      discount: formDiscount,
      grandTotal: grandTotalLive,
      paymentStatus: formPaymentStatus,
      paymentMethod: formPaymentMethod,
      paidAmount: formPaymentStatus === 'paid' ? grandTotalLive : 0,
      notes: formNotes,
      receivedBy: `${currentUser.name} (${currentUser.title})`,
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
            Stock In & Purchase Invoices
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Receive raw material shipments from wholesale suppliers. Automatically updates inventory & creates Stock Ledger entries.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Receiving / PO</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Purchase Spend"
          value={`${settings.currencySymbol} ${totalPurchasesAmount.toLocaleString()}`}
          subtitle="All recorded purchase invoices"
          icon={<DollarSign className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Total Invoices Received"
          value={purchases.length}
          subtitle="Shipments received into inventory"
          icon={<Truck className="w-5 h-5" />}
          color="slate"
        />
        <StatCard
          title="Active Registered Suppliers"
          value={suppliers.length}
          subtitle="Wholesale food & dairy vendors"
          icon={<Boxes className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Search & Invoices List */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice #, supplier, or material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Purchases Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-750">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Items Stocked In</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4">Received By</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPurchases.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">{inv.purchaseDate}</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">{inv.supplierName}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {inv.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 border border-slate-700 font-mono"
                        >
                          {it.quantity} {it.unit} {it.rawMaterialName}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-amber-400 text-sm">
                    {settings.currencySymbol} {inv.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        inv.paymentStatus === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {inv.paymentStatus} ({inv.paymentMethod})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{inv.receivedBy}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setIsDetailsModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition"
                    >
                      View Receiving Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW PURCHASE INVOICE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Receive Stock / Purchase Invoice"
        subtitle="Increases raw material quantities and generates Stock In ledger transactions"
        maxWidth="4xl"
        icon={<Truck className="w-5 h-5 text-amber-400" />}
      >
        <form onSubmit={handleSubmitPurchase} className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Supplier
              </label>
              <select
                value={formSupplierId}
                onChange={(e) => setFormSupplierId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Invoice / PO #
              </label>
              <input
                type="text"
                value={formInvoiceNo}
                onChange={(e) => setFormInvoiceNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Purchase Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Items Receiving Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Items Stock Receiving Breakdown
              </h4>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 transition"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Item
              </button>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-300 font-bold border-b border-slate-750">
                  <tr>
                    <th className="py-2.5 px-3">Raw Material</th>
                    <th className="py-2.5 px-3 w-28">Quantity</th>
                    <th className="py-2.5 px-3 w-28">Unit</th>
                    <th className="py-2.5 px-3 w-28">Unit Cost</th>
                    <th className="py-2.5 px-3 w-28">Batch #</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                    <th className="py-2.5 px-3 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {formItems.map((row, idx) => {
                    const rowTotal = row.quantity * row.unitCost;
                    const material = rawMaterialsMap.get(row.rawMaterialId);
                    const compatible = material
                      ? getCompatibleUnits(material.unit)
                      : (['KG', 'Liter', 'Piece'] as UnitType[]);

                    return (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3">
                          <select
                            value={row.rawMaterialId}
                            onChange={(e) => handleUpdateItemRow(idx, 'rawMaterialId', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            {rawMaterials.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name} ({m.sku})
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={row.quantity}
                            onChange={(e) => handleUpdateItemRow(idx, 'quantity', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                            required
                          />
                        </td>

                        <td className="py-2 px-3">
                          <select
                            value={row.unit}
                            onChange={(e) => handleUpdateItemRow(idx, 'unit', e.target.value as UnitType)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            {compatible.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={row.unitCost}
                            onChange={(e) => handleUpdateItemRow(idx, 'unitCost', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                            required
                          />
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={row.batchNumber || ''}
                            onChange={(e) => handleUpdateItemRow(idx, 'batchNumber', e.target.value)}
                            placeholder="Batch #"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </td>

                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-400">
                          {settings.currencySymbol} {rowTotal.toLocaleString()}
                        </td>

                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Grand Total Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Payment Status & Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={formPaymentStatus}
                    onChange={(e) => setFormPaymentStatus(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="paid">Paid in Full</option>
                    <option value="pending">Pending / Credit</option>
                    <option value="partial">Partial</option>
                  </select>

                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as any)}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="credit">Supplier Credit</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Receiving Remarks / Notes
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Delivered in temperature controlled van..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="space-y-2 text-right">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Items Subtotal:</span>
                <span className="font-mono text-white font-bold">
                  {settings.currencySymbol} {subtotalLive.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 items-center">
                <span>Trade Discount:</span>
                <input
                  type="number"
                  min="0"
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(parseFloat(e.target.value) || 0)}
                  className="w-28 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-right font-mono text-white"
                />
              </div>
              <div className="flex justify-between text-base font-extrabold text-amber-400 pt-2 border-t border-slate-700">
                <span>GRAND TOTAL:</span>
                <span className="font-mono">{settings.currencySymbol} {grandTotalLive.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition"
            >
              Confirm Receiving & Update Stock Ledger
            </button>
          </div>
        </form>
      </Modal>

      {/* DETAILS / RECEIVING SLIP MODAL */}
      {selectedInvoice && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Purchase Receiving Note: #${selectedInvoice.invoiceNumber}`}
          subtitle={`Supplier: ${selectedInvoice.supplierName} — ${selectedInvoice.purchaseDate}`}
          maxWidth="3xl"
          icon={<FileText className="w-5 h-5 text-amber-400" />}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block">Received By</span>
                <span className="font-bold text-white text-sm">{selectedInvoice.receivedBy}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Payment Method</span>
                <span className="font-bold uppercase text-amber-400 font-mono">
                  {selectedInvoice.paymentMethod} ({selectedInvoice.paymentStatus})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Invoice Total</span>
                <span className="font-bold text-emerald-400 font-mono text-base">
                  {settings.currencySymbol} {selectedInvoice.grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-300 font-bold border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Batch #</th>
                    <th className="py-2.5 px-3 text-right">Unit Cost</th>
                    <th className="py-2.5 px-3 text-right">Total Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {selectedInvoice.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-white">{it.rawMaterialName}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-400">
                        {it.quantity} {it.unit}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{it.batchNumber || '-'}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                        {settings.currencySymbol} {it.unitCost}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        {settings.currencySymbol} {it.totalCost.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
