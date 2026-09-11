import React, { useState, useMemo } from 'react';
import { useDb } from '../../../context/DbContext';
import { Guest } from '../../../types';
import {
  Users,
  Plus,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Search,
  Building2,
  Crown,
  Calendar,
} from 'lucide-react';
import { Modal } from '../../common/Modal';
import { StatCard } from '../../common/StatCard';

export const GuestsView: React.FC = () => {
  const { guests, saveGuest, reservations } = useDb();

  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  // Form State
  const [formId, setFormId] = useState<string | undefined>(undefined);
  const [formName, setFormName] = useState('');
  const [formCnic, setFormCnic] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formVip, setFormVip] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      return (
        g.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.cnicPassport.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [guests, searchQuery]);

  const handleOpenAddModal = () => {
    setFormId(undefined);
    setFormName('');
    setFormCnic('37405-');
    setFormPhone('+92 ');
    setFormEmail('');
    setFormAddress('Islamabad, PK');
    setFormVip(false);
    setFormNotes('');
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (guest: Guest) => {
    setFormId(guest.id);
    setFormName(guest.fullName);
    setFormCnic(guest.cnicPassport);
    setFormPhone(guest.phone);
    setFormEmail(guest.email);
    setFormAddress(guest.address);
    setFormVip(guest.vipStatus);
    setFormNotes(guest.notes || '');
    setIsEditModalOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    saveGuest({
      id: formId,
      fullName: formName,
      cnicPassport: formCnic,
      phone: formPhone,
      email: formEmail,
      address: formAddress,
      vipStatus: formVip,
      notes: formNotes,
    });
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
            Hotel Guest CRM & Resident Profiles
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Directory of hotel residents, visit histories, CNIC verification records, and active reservation linkages.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Guest</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Registered Guests"
          value={guests.length}
          subtitle="Profiles in hotel CRM"
          icon={<Users className="w-5 h-5" />}
          color="slate"
        />
        <StatCard
          title="VIP Platinum Guests"
          value={guests.filter((g) => g.vipStatus).length}
          subtitle="Distinguished residents"
          icon={<Crown className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Currently Checked In"
          value={guests.filter((g) => g.activeReservationId).length}
          subtitle="In-house dining & room occupants"
          icon={<Building2 className="w-5 h-5" />}
          color="emerald"
        />
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by guest name, CNIC, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Guests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGuests.map((guest) => {
          const activeRes = reservations.find((r) => r.id === guest.activeReservationId && r.status === 'checked_in');

          return (
            <div
              key={guest.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 shadow-xl space-y-4 flex flex-col justify-between group transition-all duration-200"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                        {guest.fullName}
                      </h3>
                      {guest.vipStatus && (
                        <span className="p-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30" title="VIP Guest">
                          <Crown className="w-3.5 h-3.5 fill-amber-400" />
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-slate-400 block mt-0.5">
                      CNIC: {guest.cnicPassport}
                    </span>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {guest.totalVisits} Visits
                  </span>
                </div>

                {/* Contact */}
                <div className="space-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-mono">{guest.phone}</span>
                  </div>
                  {guest.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{guest.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate text-slate-400">{guest.address}</span>
                  </div>
                </div>

                {/* Current Active Room */}
                {activeRes && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-300 font-bold uppercase block">Currently In-House</span>
                      <strong className="text-white font-mono text-sm">Room {activeRes.roomNumber} ({activeRes.roomType})</strong>
                    </div>
                    <span className="text-[11px] text-slate-300">Out: {activeRes.checkOutDate}</span>
                  </div>
                )}

                {guest.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-800/40 p-2 rounded-lg">
                    "{guest.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleOpenEditModal(guest)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT GUEST MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={formId ? `Edit Guest: ${formName}` : 'Register New Hotel Guest'}
        subtitle="Guest profile & CNIC details for PMS billing"
        maxWidth="md"
        icon={<Users className="w-5 h-5 text-amber-400" />}
      >
        <form onSubmit={handleSaveGuest} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Guest Full Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Dr. Sarmad Mansoor"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                CNIC / Passport Number
              </label>
              <input
                type="text"
                value={formCnic}
                onChange={(e) => setFormCnic(e.target.value)}
                placeholder="37405-1234567-1"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

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
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Email Address (Optional)
            </label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="guest@example.com"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Residential Address / City
            </label>
            <input
              type="text"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              placeholder="e.g. F-8/2, Islamabad"
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="vipCheck"
              checked={formVip}
              onChange={(e) => setFormVip(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="vipCheck" className="text-xs font-bold text-slate-200 cursor-pointer">
              Mark as VIP Resident (Priority Amenities & Concierge)
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
              Guest Preferences / Special Remarks
            </label>
            <textarea
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="e.g. Non-smoking room, high floor preference..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
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
              Save Guest Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
