import React, { useState, useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import { Supplier } from '../../../types';
import {
  Contact,
  Plus,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Truck,
  DollarSign,
  Search,
  CheckCircle2,
  Star,
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { StatCard } from '../../common/StatCard';

interface SuppliersViewProps {
  onNavigateToPurchases: () => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({ onNavigateToPurchases }) => {
  const { suppliers, saveSupplier, settings } = useDb();

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Form State
  const [formId, setFormId] = useState<string | undefined>(undefined);
  const [formName, setFormName] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formProducts, setFormProducts] = useState('');

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      return (
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.productsSupplied.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [suppliers, searchQuery]);

  const totalOutstanding = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + s.outstandingBalance, 0);
  }, [suppliers]);

  const handleOpenAddModal = () => {
    setFormId(undefined);
    setFormName('');
    setFormContactPerson('');
    setFormPhone('');
    setFormEmail('');
    setFormAddress('');
    setFormProducts('Fresh Meat, Spices, Grains');
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (sup: Supplier) => {
    setFormId(sup.id);
    setFormName(sup.name);
    setFormContactPerson(sup.contactPerson);
    setFormPhone(sup.phone);
    setFormEmail(sup.email);
    setFormAddress(sup.address);
    setFormProducts(sup.productsSupplied.join(', '));
    setIsEditModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    const productArray = formProducts
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    saveSupplier({
      id: formId,
      name: formName,
      contactPerson: formContactPerson,
      phone: formPhone,
      email: formEmail,
      address: formAddress,
      productsSupplied: productArray,
      status: 'active',
      rating: 4.8,
    });

    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
            Wholesale Suppliers & Vendor Directory
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage relationships with poultry, meat, dairy, grains and spice wholesale vendors.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Supplier</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Registered Suppliers"
          value={suppliers.length}
          subtitle="Active wholesale partners"
          icon={<Contact className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Outstanding Payable Balance"
          value={`${settings.currencySymbol} ${totalOutstanding.toLocaleString()}`}
          subtitle="Pending invoices payable to vendors"
          icon={<DollarSign className="w-5 h-5" />}
          color="rose"
        />
        <StatCard
          title="Procurement Orders"
          value="100% On Time"
          subtitle="Supplier fulfillment reliability"
          icon={<Truck className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suppliers by name, contact, or item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Suppliers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSuppliers.map((sup) => (
          <div
            key={sup.id}
            className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 shadow-xl space-y-4 flex flex-col justify-between group transition-all duration-200"
          >
            {/* Top */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                    {sup.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">{sup.contactPerson}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{sup.rating || '4.8'}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-mono">{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{sup.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate text-slate-400">{sup.address}</span>
                </div>
              </div>

              {/* Products Supplied Chips */}
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Supplies Provided:
                </span>
                <div className="flex flex-wrap gap-1">
                  {sup.productsSupplied.map((p, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-amber-300/90 border border-slate-700"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Financials Strip & Actions */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-750 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Purchases</span>
                  <span className="font-mono font-bold text-white">
                    {settings.currencySymbol} {sup.totalPurchases.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Payable Balance</span>
                  <span className="font-mono font-extrabold text-rose-400">
                    {settings.currencySymbol} {sup.outstandingBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => onNavigateToPurchases()}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition text-center"
                >
                  + Stock In Purchase
                </button>
                <button
                  onClick={() => handleOpenEditModal(sup)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                  title="Edit Supplier"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT SUPPLIER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={formId ? `Edit Supplier: ${formName}` : 'Add Wholesale Supplier'}
        subtitle="Register food & beverage raw material vendor"
        maxWidth="md"
        icon={<Contact className="w-5 h-5 text-amber-400" />}
      >
        <form onSubmit={handleSaveSupplier} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Company / Vendor Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Al-Madina Meat & Poultry Hub"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Contact Person
            </label>
            <input
              type="text"
              value={formContactPerson}
              onChange={(e) => setFormContactPerson(e.target.value)}
              placeholder="e.g. Haji Aslam"
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
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="orders@supplier.com"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Physical Wholesale Address
            </label>
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="e.g. Wholesale Grain Market, Rawalpindi"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Supplies Provided (Comma Separated)
            </label>
            <input
              type="text"
              value={formProducts}
              onChange={(e) => setFormProducts(e.target.value)}
              placeholder="e.g. Basmati Rice, Flour, Sugar"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
