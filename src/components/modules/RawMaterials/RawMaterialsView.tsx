import React, { useState, useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import { RawMaterial, RawMaterialCategory, UnitType } from '../../../types';
import {
  Boxes,
  Plus,
  Edit2,
  SlidersHorizontal,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  Layers,
  ArrowUpDown,
  Filter,
  Trash2,
  RotateCcw,
  Eye,
  BookOpen,
  History,
  TrendingDown,
  TrendingUp,
  Package,
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { StatCard } from '../../common/StatCard';
import {
  smartFormatBaseQuantity,
  fromBaseUnitQuantity,
  formatQuantityWithUnit,
  UNIT_DEFINITIONS,
  toBaseUnitQuantity,
} from '../../../utils/unitConverter';

const CATEGORIES: RawMaterialCategory[] = [
  'Meat & Poultry',
  'Seafood',
  'Grains & Pulses',
  'Oils & Fats',
  'Spices & Seasonings',
  'Dairy & Eggs',
  'Fresh Vegetables',
  'Fruits',
  'Beverages & Syrups',
  'Flour & Bakery',
  'Packaging & Consumables',
  'Sauces & Condiments',
  'Tea & Coffee',
  'Prepared Ingredients',
  'Frozen Items',
  'Other',
];

const UNIT_OPTIONS: Array<{ value: UnitType; label: string }> = [
  { value: 'KG', label: 'Kilogram (KG) - Base: Gram' },
  { value: 'Gram', label: 'Gram (g) - Base: Gram' },
  { value: 'Liter', label: 'Liter (L) - Base: ML' },
  { value: 'ML', label: 'Milliliter (ml) - Base: ML' },
  { value: 'Cup', label: 'Cup (250 ml) - Base: ML' },
  { value: 'Piece', label: 'Piece (pcs) - Base: Piece' },
  { value: 'Dozen', label: 'Dozen (12 pcs) - Base: Piece' },
  { value: 'Pack', label: 'Packet / Pack (pk) - Base: Piece' },
  { value: 'Box', label: 'Box (bx) - Base: Piece' },
  { value: 'Bottle', label: 'Bottle (btl) - Base: Piece' },
  { value: 'Plate', label: 'Plate (plt) - Base: Piece' },
  { value: 'Portion', label: 'Portion (prt) - Base: Piece' },
  { value: 'Other', label: 'Other Unit - Base: Piece' },
];

export const RawMaterialsView: React.FC = () => {
  const {
    rawMaterials,
    recipes,
    suppliers,
    stockLedger,
    wasteRecords,
    addRawMaterial,
    updateRawMaterial,
    adjustStock,
    deleteRawMaterial,
    settings,
  } = useDb();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);

  // Form State for Add / Edit Raw Material
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState<RawMaterialCategory>('Meat & Poultry');
  const [formUnit, setFormUnit] = useState<UnitType>('KG');
  const [formCurrentQty, setFormCurrentQty] = useState<number>(10);
  const [formMinStock, setFormMinStock] = useState<number>(5);
  const [formPrice, setFormPrice] = useState<number>(500);
  const [formSupplierId, setFormSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [formPurchaseDate, setFormPurchaseDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [formExpiry, setFormExpiry] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Form State for Stock Adjustment
  const [adjustDisplayQty, setAdjustDisplayQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Physical count reconciliation');

  // Filtered raw materials
  const filteredMaterials = useMemo(() => {
    return rawMaterials.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'active' && item.status === 'active') ||
        (selectedStatus === 'low_stock' && item.status === 'low_stock') ||
        (selectedStatus === 'out_of_stock' && item.status === 'out_of_stock');
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [rawMaterials, searchQuery, selectedCategory, selectedStatus]);

  // Inventory Totals & Valuation (Current Stock * Unit Cost)
  const totalInventoryValue = useMemo(() => {
    return rawMaterials.reduce((sum, item) => {
      const displayQty = fromBaseUnitQuantity(item.currentQty, item.unit);
      return sum + displayQty * item.purchasePrice;
    }, 0);
  }, [rawMaterials]);

  const lowStockCount = rawMaterials.filter((m) => m.status === 'low_stock').length;
  const outOfStockCount = rawMaterials.filter((m) => m.status === 'out_of_stock').length;

  const handleOpenAddModal = () => {
    const timestamp = Date.now().toString().slice(-4);
    setFormName('');
    setFormSku(`RM-${timestamp}`);
    setFormCategory('Meat & Poultry');
    setFormUnit('KG');
    setFormCurrentQty(10);
    setFormMinStock(5);
    setFormPrice(500);
    setFormSupplierId(suppliers[0]?.id || '');
    setFormPurchaseDate(new Date().toISOString().slice(0, 10));
    setFormExpiry('');
    setFormDescription('');
    setFormIsActive(true);
    setIsAddModalOpen(true);
  };

  const handleOpenAdjustModal = (material: RawMaterial) => {
    setSelectedMaterial(material);
    const displayQty = fromBaseUnitQuantity(material.currentQty, material.unit);
    setAdjustDisplayQty(displayQty);
    setAdjustReason('Physical store count reconciliation');
    setIsAdjustModalOpen(true);
  };

  const handleOpenDetailsModal = (material: RawMaterial) => {
    setSelectedMaterial(material);
    setIsDetailsModalOpen(true);
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === formSupplierId);
    const baseUnit = UNIT_DEFINITIONS[formUnit]?.baseUnit || formUnit;

    addRawMaterial({
      name: formName,
      sku: formSku,
      category: formCategory,
      unit: formUnit,
      baseUnit,
      currentQty: formCurrentQty,
      minStockLevel: formMinStock,
      purchasePrice: formPrice,
      supplierId: formSupplierId,
      supplierName: sup ? sup.name : 'General Supplier',
      purchaseDate: formPurchaseDate,
      expiryDate: formExpiry || undefined,
      description: formDescription,
      notes: formDescription,
      isActive: formIsActive,
    });

    setIsAddModalOpen(false);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) return;
    adjustStock(selectedMaterial.id, adjustDisplayQty, adjustReason);
    setIsAdjustModalOpen(false);
  };

  // Recipes consuming the selected material
  const linkedRecipes = useMemo(() => {
    if (!selectedMaterial) return [];
    return recipes.filter((r) =>
      r.ingredients.some((ing) => ing.rawMaterialId === selectedMaterial.id)
    );
  }, [recipes, selectedMaterial]);

  // Total consumed & wasted calculations for selected material
  const materialLedgerHistory = useMemo(() => {
    if (!selectedMaterial) return [];
    return stockLedger.filter((l) => l.rawMaterialId === selectedMaterial.id);
  }, [stockLedger, selectedMaterial]);

  const totalConsumedDisplay = useMemo(() => {
    if (!selectedMaterial) return 0;
    const consumedBase = materialLedgerHistory
      .filter((l) => l.type === 'CONSUMPTION' || l.type === 'SALE_CONSUMPTION' || l.type === 'Order Consumption')
      .reduce((sum, l) => sum + Math.abs(l.baseQtyChange), 0);
    return fromBaseUnitQuantity(consumedBase, selectedMaterial.unit);
  }, [materialLedgerHistory, selectedMaterial]);

  const totalWastedDisplay = useMemo(() => {
    if (!selectedMaterial) return 0;
    const wastedBase = materialLedgerHistory
      .filter((l) => l.type === 'Waste' || l.type === 'WASTE')
      .reduce((sum, l) => sum + Math.abs(l.baseQtyChange), 0);
    return fromBaseUnitQuantity(wastedBase, selectedMaterial.unit);
  }, [materialLedgerHistory, selectedMaterial]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight font-royal">
            Raw Material Inventory & Stock Control
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track ingredients, purchase valuations, minimum threshold alerts, and real-time ledger balances.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Raw Material</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Raw Materials"
          value={rawMaterials.length}
          subtitle="Cataloged ingredients"
          icon={<Boxes className="w-5 h-5" />}
          color="slate"
        />
        <StatCard
          title="Total Stock Value"
          value={`${settings.currencySymbol} ${Math.round(totalInventoryValue).toLocaleString()}`}
          subtitle="At current purchase cost"
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          subtitle="Below minimum threshold"
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
          badge={lowStockCount > 0 ? 'Action Needed' : undefined}
        />
        <StatCard
          title="Out of Stock"
          value={outOfStockCount}
          subtitle="Zero available balance"
          icon={<XCircle className="w-5 h-5" />}
          color="rose"
          badge={outOfStockCount > 0 ? 'Critical' : undefined}
        />
      </div>

      {/* Filters & Search */}
      <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ingredient name, SKU, or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="active">In Stock</option>
              <option value="low_stock">Low Stock (Alert)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Category Pills with Dynamic Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
              selectedCategory === 'All'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            All Categories ({rawMaterials.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = rawMaterials.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Raw Materials Data Table */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Item Name &amp; SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right" title="Total quantity received through all purchases/stock-in transactions. Never reduced by consumption.">
                  Total Stock In ↑
                </th>
                <th className="py-3.5 px-4 text-right" title="Currently available quantity after consumption, waste, adjustments and returns.">
                  Current Stock ✓
                </th>
                <th className="py-3.5 px-4 text-right">Min Level</th>
                <th className="py-3.5 px-4 text-right">Unit Cost</th>
                <th className="py-3.5 px-4 text-right">Stock Value</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500">
                    No raw materials match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((item) => {
                  const displayQty = fromBaseUnitQuantity(item.currentQty, item.unit);
                  const valuation = displayQty * item.purchasePrice;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      {/* Name & SKU */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleOpenDetailsModal(item)}
                          className="text-left group flex flex-col"
                        >
                          <span className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition">
                            {item.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">{item.sku}</span>
                        </button>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                      </td>

                      {/* Total Stock In */}
                      <td className="py-3.5 px-4 text-right" title="Total quantity received through purchases/stock-in. Never reduced by consumption.">
                        <div className="font-mono font-semibold text-sky-700 text-sm">
                          {smartFormatBaseQuantity(item.totalStockIn ?? item.currentQty, item.baseUnit)}
                        </div>
                        <span className="text-[9px] text-sky-600 uppercase tracking-wide">cumulative in</span>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-extrabold text-sm text-slate-900">
                          {smartFormatBaseQuantity(item.currentQty, item.baseUnit)}
                        </div>
                        <span className="text-[9px] text-emerald-700 uppercase tracking-wide">available now</span>
                      </td>

                      {/* Min Level */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {item.minStockLevel} {item.unit}
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700">
                        {settings.currencySymbol} {item.purchasePrice.toLocaleString()} / {item.unit}
                      </td>

                      {/* Valuation */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {settings.currencySymbol} {Math.round(valuation).toLocaleString()}
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium truncate max-w-[140px]">
                        {item.supplierName}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            item.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : item.status === 'low_stock'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 animate-bounce'
                          }`}
                        >
                          {item.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                          {item.status === 'low_stock' && <AlertTriangle className="w-3 h-3" />}
                          {item.status === 'out_of_stock' && <XCircle className="w-3 h-3" />}
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetailsModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 transition"
                            title="View Recipes & Stock History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenAdjustModal(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition"
                            title="Adjust Stock Quantity (Audit Ledger)"
                          >
                            <SlidersHorizontal className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete raw material "${item.name}"?`)) {
                                deleteRawMaterial(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD RAW MATERIAL MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Raw Material"
        subtitle="Register new raw material ingredient in inventory database"
        maxWidth="2xl"
        icon={<Boxes className="w-5 h-5 text-amber-600" />}
      >
        <form onSubmit={handleSaveMaterial} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Material Name *
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Basmati Rice"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                SKU / Item Code *
              </label>
              <input
                type="text"
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as RawMaterialCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Unit of Measurement *
              </label>
              <select
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value as UnitType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              >
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Initial Stock ({formUnit}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formCurrentQty}
                onChange={(e) => setFormCurrentQty(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Minimum Stock Level ({formUnit}) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formMinStock}
                onChange={(e) => setFormMinStock(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Unit Cost / Purchase Price ({settings.currencySymbol} per {formUnit}) *
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formPrice}
                onChange={(e) => setFormPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Primary Supplier *
              </label>
              <select
                value={formSupplierId}
                onChange={(e) => setFormSupplierId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              >
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Purchase Date
              </label>
              <input
                type="date"
                value={formPurchaseDate}
                onChange={(e) => setFormPurchaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={formExpiry}
                onChange={(e) => setFormExpiry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
              Description & Storage Notes
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="e.g. Keep in dry storage or temperature controlled cooling..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="rounded bg-slate-100 border-slate-300 text-amber-600 focus:ring-0"
              />
              <span>Active in Recipe Engineering & POS</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition"
              >
                Create Item & Log Initial Ledger
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ADJUST STOCK MODAL */}
      {selectedMaterial && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Adjust Stock: ${selectedMaterial.name}`}
          subtitle="Physical inventory reconciliation with automatic Stock Ledger recording"
          maxWidth="md"
          icon={<SlidersHorizontal className="w-5 h-5 text-amber-600" />}
        >
          <form onSubmit={handleConfirmAdjust} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Stock Balance:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {smartFormatBaseQuantity(selectedMaterial.currentQty, selectedMaterial.baseUnit)} (
                  {fromBaseUnitQuantity(selectedMaterial.currentQty, selectedMaterial.unit)} {selectedMaterial.unit})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Stock In (Cumulative):</span>
                <span className="font-mono text-sky-700">
                  {smartFormatBaseQuantity(selectedMaterial.totalStockIn ?? selectedMaterial.currentQty, selectedMaterial.baseUnit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Purchase Price:</span>
                <span className="font-mono text-emerald-700">
                  {settings.currencySymbol} {selectedMaterial.purchasePrice} / {selectedMaterial.unit}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                New Actual Count ({selectedMaterial.unit})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={adjustDisplayQty}
                onChange={(e) => setAdjustDisplayQty(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Adjustment Reason / Audit Remark
              </label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-amber-500 mb-2"
              >
                <option value="Physical store count reconciliation">Physical store count reconciliation</option>
                <option value="Cycle count discrepancy correction">Cycle count discrepancy correction</option>
                <option value="Damaged packaging write-off">Damaged packaging write-off</option>
                <option value="Chef kitchen audit correction">Chef kitchen audit correction</option>
                <option value="Management stock take adjustment">Management stock take adjustment</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition"
              >
                Confirm Stock Adjustment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* USED IN RECIPES & DETAILED STOCK AUDIT MODAL */}
      {selectedMaterial && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Raw Material: ${selectedMaterial.name}`}
          subtitle={`SKU: ${selectedMaterial.sku} | Category: ${selectedMaterial.category} | Supplier: ${selectedMaterial.supplierName}`}
          maxWidth="3xl"
          icon={<Package className="w-5 h-5 text-amber-600" />}
        >
          <div className="space-y-6">
            {/* Key Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Stock In</span>
                <span className="text-sm font-extrabold text-sky-700 font-mono">
                  {smartFormatBaseQuantity(selectedMaterial.totalStockIn ?? selectedMaterial.currentQty, selectedMaterial.baseUnit)}
                </span>
                <span className="text-[9px] text-slate-500 block">Cumulative received</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Stock</span>
                <span className="text-sm font-extrabold text-emerald-700 font-mono">
                  {smartFormatBaseQuantity(selectedMaterial.currentQty, selectedMaterial.baseUnit)}
                </span>
                <span className="text-[9px] text-slate-500 block">Available now</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Consumed</span>
                <span className="text-sm font-extrabold text-amber-700 font-mono">
                  {formatQuantityWithUnit(totalConsumedDisplay, selectedMaterial.unit)}
                </span>
                <span className="text-[9px] text-slate-500 block">Via POS recipes</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Stock Value</span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">
                  {settings.currencySymbol}{' '}
                  {Math.round(
                    fromBaseUnitQuantity(selectedMaterial.currentQty, selectedMaterial.unit) *
                      selectedMaterial.purchasePrice
                  ).toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-500 block">Current valuation</span>
              </div>
            </div>

            {/* SECTION 1: USED IN RECIPES */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Used In Recipes / BOM ({linkedRecipes.length} Dishes)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500">
                  Automatically deducted upon order completion
                </span>
              </div>

              {linkedRecipes.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  This raw material is not currently used in any recipe BOMs.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Recipe / Dish Name</th>
                        <th className="py-2.5 px-3">Portion</th>
                        <th className="py-2.5 px-3 text-right">Qty Consumed</th>
                        <th className="py-2.5 px-3 text-right">Ingredient Cost</th>
                        <th className="py-2.5 px-3 text-right">Dish Price</th>
                        <th className="py-2.5 px-3 text-right">Food Cost %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {linkedRecipes.map((recipe) => {
                        const ing = recipe.ingredients.find(
                          (i) => i.rawMaterialId === selectedMaterial.id
                        );
                        return (
                          <tr key={recipe.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900">{recipe.menuItemName}</span>
                              <span className="block font-mono text-[10px] text-slate-500">
                                {recipe.code || 'BOM'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {recipe.portionSize || 'Single'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700">
                              {ing ? formatQuantityWithUnit(ing.quantity, ing.unit) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                              {settings.currencySymbol}{' '}
                              {ing ? ing.calculatedCost.toFixed(2) : '0.00'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                              {settings.currencySymbol} {recipe.sellingPrice}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                              {recipe.foodCostPercentage}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SECTION 2: RECENT STOCK MOVEMENTS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-sky-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Recent Stock Movements ({materialLedgerHistory.slice(0, 5).length})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-500">
                  Last 5 recorded ledger transactions
                </span>
              </div>

              {materialLedgerHistory.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No stock ledger entries recorded yet for this material.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3 text-right">Quantity</th>
                        <th className="py-2 px-3 text-right">Balance</th>
                        <th className="py-2 px-3">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {materialLedgerHistory.slice(0, 5).map((l) => (
                        <tr key={l.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                            {new Date(l.date).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                l.type.includes('Stock In') || l.type.includes('STOCK IN')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : l.type.includes('CONSUMPTION') || l.type.includes('Consumption')
                                  ? 'bg-amber-100 text-amber-800'
                                  : l.type.includes('Waste') || l.type.includes('WASTE')
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {l.type}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                            {l.baseQtyChange > 0 ? '+' : ''}
                            {formatQuantityWithUnit(l.quantity, l.unit)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-700">
                            {l.newBalance} {l.unit}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">
                            {l.referenceId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
