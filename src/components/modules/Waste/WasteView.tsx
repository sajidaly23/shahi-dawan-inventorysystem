import React, { useState, useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import { WasteRecord, WasteReason, UnitType } from '../../../types';
import {
  Trash2,
  Plus,
  Search,
  DollarSign,
  AlertTriangle,
  Flame,
  Calendar,
  Layers,
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { StatCard } from '../../common/StatCard';
import { getCompatibleUnits, formatQuantityWithUnit } from '../../../utils/unitConverter';

export const WasteView: React.FC = () => {
  const { wasteRecords, rawMaterials, rawMaterialsMap, recordWaste, settings, currentUser } = useDb();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>('All');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form State
  const [formMaterialId, setFormMaterialId] = useState(rawMaterials[0]?.id || '');
  const [formQuantity, setFormQuantity] = useState<number>(1);
  const [formUnit, setFormUnit] = useState<UnitType>('KG');
  const [formReason, setFormReason] = useState<WasteReason>('damaged');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState('');

  // Filtered waste records
  const filteredRecords = useMemo(() => {
    return wasteRecords.filter((w) => {
      const matchesSearch =
        w.rawMaterialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.recordNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesReason = selectedReason === 'All' || w.reason === selectedReason;
      return matchesSearch && matchesReason;
    });
  }, [wasteRecords, searchQuery, selectedReason]);

  // Total financial loss
  const totalLoss = useMemo(() => {
    return wasteRecords.reduce((sum, w) => sum + w.totalCostLoss, 0);
  }, [wasteRecords]);

  const handleOpenRecordModal = () => {
    const first = rawMaterials[0];
    if (first) {
      setFormMaterialId(first.id);
      setFormUnit(first.unit);
      setFormQuantity(1);
      setFormReason('damaged');
      setFormDate(new Date().toISOString().slice(0, 10));
      setFormNotes('');
      setIsRecordModalOpen(true);
    }
  };

  const handleSelectMaterial = (matId: string) => {
    setFormMaterialId(matId);
    const mat = rawMaterialsMap.get(matId);
    if (mat) {
      setFormUnit(mat.unit);
    }
  };

  const handleSubmitWaste = (e: React.FormEvent) => {
    e.preventDefault();
    const material = rawMaterialsMap.get(formMaterialId);
    if (!material) return;

    recordWaste({
      date: new Date().toISOString(),
      rawMaterialId: formMaterialId,
      rawMaterialName: material.name,
      sku: material.sku,
      quantity: formQuantity,
      unit: formUnit,
      unitCost: material.purchasePrice,
      reason: formReason,
      recordedBy: currentUser.name,
      notes: formNotes,
    });

    setIsRecordModalOpen(false);
  };

  const reasonBadges: Record<WasteReason, { label: string; bg: string }> = {
    expired: { label: 'Expired', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
    damaged: { label: 'Damaged / Spoiled', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    burned: { label: 'Burned Food', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
    spilled: { label: 'Spilled / Dropped', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' },
    kitchen_waste: { label: 'Kitchen Prep Trimmings', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
    customer_return: { label: 'Customer Return', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    other: { label: 'Other Waste', bg: 'bg-slate-700 text-slate-300 border-slate-600' },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
            Kitchen & Inventory Waste Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Record spoiled, burned, or spilled ingredients. Automatically deducts inventory stock & tallies financial loss.
          </p>
        </div>

        <button
          onClick={handleOpenRecordModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Record Kitchen Waste</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Financial Loss"
          value={`${settings.currencySymbol} ${Math.round(totalLoss).toLocaleString()}`}
          subtitle="Cumulative cost of all waste logs"
          icon={<DollarSign className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title="Total Waste Incidents"
          value={wasteRecords.length}
          subtitle="Logged waste transactions"
          icon={<Trash2 className="w-5 h-5" />}
          color="slate"
        />
        <StatCard
          title="Most Frequent Cause"
          value="Damaged / Spoiled"
          subtitle="Identified from incident analysis"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search waste by item name, SKU, or record #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedReason}
          onChange={(e) => setSelectedReason(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 w-full sm:w-auto"
        >
          <option value="All">All Waste Reasons</option>
          <option value="damaged">Damaged / Spoiled</option>
          <option value="expired">Expired Ingredients</option>
          <option value="burned">Burned Food</option>
          <option value="spilled">Spilled / Dropped</option>
          <option value="kitchen_waste">Kitchen Prep Trimmings</option>
          <option value="customer_return">Customer Return</option>
        </select>
      </div>

      {/* Waste Records Table */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-750">
              <tr>
                <th className="py-3.5 px-4">Record #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Material / Item</th>
                <th className="py-3.5 px-4">Quantity Waste</th>
                <th className="py-3.5 px-4">Reason Category</th>
                <th className="py-3.5 px-4 text-right">Cost Loss</th>
                <th className="py-3.5 px-4">Logged By</th>
                <th className="py-3.5 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRecords.map((w) => (
                <tr key={w.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">{w.recordNumber}</td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(w.date).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white text-xs">{w.rawMaterialName}</div>
                    <span className="font-mono text-[10px] text-slate-400">{w.sku}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-400 text-sm">
                    {formatQuantityWithUnit(w.quantity, w.unit)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        reasonBadges[w.reason]?.bg
                      }`}
                    >
                      {reasonBadges[w.reason]?.label || w.reason}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-rose-400 text-sm">
                    {settings.currencySymbol} {w.totalCostLoss.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-[11px]">{w.recordedBy}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">{w.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD WASTE MODAL */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Kitchen Waste & Loss"
        subtitle="Deducts the specified raw material from inventory and records financial loss"
        maxWidth="md"
        icon={<Trash2 className="w-5 h-5 text-rose-400" />}
      >
        <form onSubmit={handleSubmitWaste} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Select Raw Material
            </label>
            <select
              value={formMaterialId}
              onChange={(e) => handleSelectMaterial(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            >
              {rawMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Waste Quantity
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={formQuantity}
                onChange={(e) => setFormQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Unit
              </label>
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value as UnitType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {rawMaterialsMap.get(formMaterialId)
                  ? getCompatibleUnits(rawMaterialsMap.get(formMaterialId)!.unit).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))
                  : ['KG', 'Liter', 'Piece'].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Reason for Waste
            </label>
            <select
              value={formReason}
              onChange={(e) => setFormReason(e.target.value as WasteReason)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="damaged">Damaged / Spoiled Ingredients</option>
              <option value="expired">Expired Past Shelf Life</option>
              <option value="burned">Burned / Overcooked Food</option>
              <option value="spilled">Spilled / Dropped on Floor</option>
              <option value="kitchen_waste">Kitchen Prep Trimmings</option>
              <option value="customer_return">Customer Return / Wrong Order</option>
              <option value="other">Other Reason</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Incident Notes / Explanation
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Slipped during peak dinner rush..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950 transition"
            >
              Deduct Stock & Record Loss
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
