import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Sparkles, Building2, ChefHat, Boxes } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <nav className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <Link href="/login" className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-white border border-slate-700">
          Sign In
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-16 space-y-10 flex-1">
        <div className="space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">About the System</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-royal text-white">
            Engineering Precision for High-End Culinary & Hotel Operations
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Shahi Diwan Grand ERP was designed to solve the chronic problem of unexplained kitchen variance and food cost leakage in fine dining restaurants and boutique luxury hotels.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-3">
            <ChefHat className="w-6 h-6 text-amber-400" />
            <h3 className="text-base font-bold text-white">Closed-Loop Recipe BOM</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every dish on the menu has a configured Bill of Materials. When dishes are served through POS or Room Service, raw ingredients like broiler chicken, mutton, basmati rice, and spices are deducted down to exact grams.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-3">
            <Building2 className="w-6 h-6 text-sky-400" />
            <h3 className="text-base font-bold text-white">Hotel & Dining Integration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seamless linkage between hotel guest rooms and restaurant dining. Room charges, laundry, and dining orders automatically post to active guest folios for single-invoice checkout settlement.
            </p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <h3 className="text-lg font-bold text-white font-royal">Experience the Platform</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Ready to explore the executive dashboard and test live kitchen tickets?
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs border border-slate-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
