'use client';

import React, { useState } from 'react';
import { useDb } from '../../../context/DbContext';
import {
  Settings as SettingsIcon,
  Building,
  Percent,
  Volume2,
  Download,
  Upload,
  RotateCcw,
  ShieldAlert,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { ConfirmDialog } from '../../common/ConfirmDialog';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetAllData,
    exportDatabaseJSON,
    importDatabaseJSON,
    showToast,
  } = useDb();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(settings.defaultTaxRate);
  const [defaultServiceCharge, setDefaultServiceCharge] = useState<number>(
    settings.defaultServiceCharge
  );
  const [allowNegativeInventory, setAllowNegativeInventory] = useState(
    settings.allowNegativeInventory
  );
  const [enableSoundFx, setEnableSoundFx] = useState(settings.enableSoundFx);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber);
  const [ntnNumber, setNtnNumber] = useState(settings.ntnNumber);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName,
      tagline,
      currencySymbol,
      defaultTaxRate,
      defaultServiceCharge,
      allowNegativeInventory,
      enableSoundFx,
      address,
      phone,
      email,
      gstNumber,
      ntnNumber,
    });
  };

  const handleExportBackup = () => {
    const json = exportDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shahi_diwan_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Backup Exported', 'Full ERP database backup downloaded.');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight font-royal">
            System Configuration & ERP Parameters
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure business identity, tax rates, inventory deduction strictness, sound FX, and database backups.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Business Information Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Business Profile & Receipts Header
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Business / Hotel Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-royal"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Tagline / Subheading
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Currency Symbol
              </label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Official Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                GST Tax Registration Number
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                NTN Number
              </label>
              <input
                type="text"
                value={ntnNumber}
                onChange={(e) => setNtnNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Taxes & Inventory Rules Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Percent className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Taxes, Inventory Validation & Audio
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Default GST Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                Service Charge (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={defaultServiceCharge}
                onChange={(e) => setDefaultServiceCharge(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>
          </div>

          {/* Toggle Negative Inventory */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750 flex items-start gap-3">
            <input
              type="checkbox"
              id="negativeInv"
              checked={allowNegativeInventory}
              onChange={(e) => setAllowNegativeInventory(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer mt-0.5"
            />
            <div>
              <label htmlFor="negativeInv" className="text-xs font-bold text-white cursor-pointer block">
                Allow Negative Inventory Overrides
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                When disabled (recommended), POS orders cannot be confirmed if required BOM recipe ingredients are insufficient.
              </p>
            </div>
          </div>

          {/* Toggle Audio */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-750 flex items-start gap-3">
            <input
              type="checkbox"
              id="soundFx"
              checked={enableSoundFx}
              onChange={(e) => setEnableSoundFx(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 cursor-pointer mt-0.5"
            />
            <div>
              <label htmlFor="soundFx" className="text-xs font-bold text-white cursor-pointer block">
                Enable Audio Synthesizer Sounds
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Plays responsive audio chimes for new POS orders, kitchen bells, stock-in confirmations, and error alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-950 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>

      {/* Database Backup & Disaster Recovery Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Data Backup & Database Reset
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Export full JSON snapshots containing all raw materials, recipes, menu items, order ledgers, and hotel folios.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export Database JSON</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Import Database JSON</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Initial Demo Seeds</span>
          </button>
        </div>
      </div>

      {/* CONFIRM RESET DIALOG */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetAllData}
        title="Reset Entire Database to Seed Data?"
        message="This will restore all 25+ raw materials, authentic BOM recipes, suppliers, active table layouts, hotel suites, and transaction ledgers to the factory demo defaults."
        confirmLabel="Reset Everything"
        variant="danger"
      />
    </div>
  );
};
