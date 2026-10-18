import React from 'react';
import Link from 'next/link';
import {
  Boxes,
  ChefHat,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  Flame,
  ArrowRight,
  Sparkles,
  Layers,
  BarChart3,
  CheckCircle2,
  Table,
  Building2,
  Clock,
  Zap,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* ─────────────────────────────────────────────────────────────────────────
          PUBLIC TOP NAVIGATION
          ───────────────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-[#0b101d]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-[1.5px] shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0a0e1a] rounded-[10px] flex items-center justify-center">
                <span className="font-royal text-xl font-bold gold-gradient-text tracking-wider">
                  S
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-wide font-royal text-white">
                  Shahi Diwan Grand
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase royal-badge">
                  ERP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Luxury Hotel & Royal Dining System</p>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide">
            <Link href="#features" className="text-slate-300 hover:text-amber-400 transition">
              Features
            </Link>
            <Link href="#how-it-works" className="text-slate-300 hover:text-amber-400 transition">
              How It Works
            </Link>
            <Link href="#why-choose" className="text-slate-300 hover:text-amber-400 transition">
              Why Choose
            </Link>
            <Link href="/about" className="text-slate-300 hover:text-amber-400 transition">
              About
            </Link>
            <Link href="/contact" className="text-slate-300 hover:text-amber-400 transition">
              Contact
            </Link>
          </div>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-900 border border-slate-700/80 hover:border-amber-500/40 transition shadow-sm"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs font-extrabold text-slate-950 gold-gradient-bg shadow-lg shadow-amber-500/25 hover:brightness-110 transition transform active:scale-95"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────────
          HERO SECTION
          ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Ambient Radial Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Next-Generation Restaurant & Hotel ERP</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-royal text-white max-w-4xl mx-auto leading-tight drop-shadow-sm">
            Smart Inventory Management for{' '}
            <span className="gold-gradient-text">Modern Restaurants</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Manage raw materials, stock movements, recipes, kitchen operations, and restaurant orders from one organized platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl gold-gradient-bg text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 hover:brightness-110 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900/90 text-slate-200 font-bold text-sm border border-slate-700/80 hover:bg-slate-800 hover:border-amber-500/40 transition flex items-center justify-center gap-2"
            >
              <span>Sign In to System</span>
            </Link>
          </div>

          {/* Interactive ERP System Preview Mockup */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="p-3 sm:p-5 rounded-3xl bg-[#0c1222]/90 border border-slate-800 shadow-2xl backdrop-blur-2xl relative">
              {/* Top Chrome Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-400 font-mono ml-2">shahi-diwan.internal/dashboard</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[10px]">
                  <span className="text-emerald-400 flex items-center gap-1">● Database Connected</span>
                  <span>PKR Standard</span>
                </div>
              </div>

              {/* Preview Grid inside Laptop Shell */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-left">
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-amber-500/30 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Inventory Value</span>
                  <div className="text-xl font-extrabold text-white">Rs. 2,478,500</div>
                  <span className="text-[10px] text-emerald-400">16 Raw Materials Active</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipe BOM Costing</span>
                  <div className="text-xl font-extrabold text-white">28.4% Avg Food Cost</div>
                  <span className="text-[10px] text-emerald-400">Optimal Profit Margins</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live KDS Board</span>
                  <div className="text-xl font-extrabold text-white">3 Active Tickets</div>
                  <span className="text-[10px] text-amber-400">Avg Prep: 12 Minutes</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hotel Occupancy</span>
                  <div className="text-xl font-extrabold text-white">40% Live Suites</div>
                  <span className="text-[10px] text-sky-400">Dining Integrated Folio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          FEATURES SECTION
          ───────────────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 bg-[#070b14]/70 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 font-mono">
              Complete Hospitality Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-royal text-white">
              Every Tool Required to Run a 5-Star Operation
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Designed specifically for high-volume royal restaurants and boutique luxury hotel dining.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-[#0f172a]/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl space-y-3 group">
              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 w-fit group-hover:scale-105 transition-transform">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Raw Materials & Inventory</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track unit-level items across kilograms, grams, liters, and pieces with safety buffer thresholds and real-time alerts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-[#0f172a]/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl space-y-3 group">
              <div className="p-3 rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30 w-fit group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Recipe BOM Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configure ingredient proportions with live food costing % and gross margin calculation for every menu item.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-[#0f172a]/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl space-y-3 group">
              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 w-fit group-hover:scale-105 transition-transform">
                <ChefHat className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Kitchen Display System</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live 4-column kitchen order terminal with urgency timers and automatic BOM deduction when orders are marked completed.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-[#0f172a]/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl space-y-3 group">
              <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 w-fit group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">POS Order Terminal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Lightning fast touch catalog with real-time stock pre-check validation, table selection, and thermal receipt printing.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-[#0f172a]/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl space-y-3 group">
              <div className="p-3 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 w-fit group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Hotel Room PMS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Room status matrix, guest check-in/out workflows, and dining room charges posted directly to resident room folios.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-[#0f172a]/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl space-y-3 group">
              <div className="p-3 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30 w-fit group-hover:scale-105 transition-transform">
                <Table className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Floor Plan & Tables</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visual dining hall, terrace, and garden table occupancy with diner party reservations and active order linkage.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="p-6 rounded-3xl bg-[#0f172a]/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl space-y-3 group">
              <div className="p-3 rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 w-fit group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Stock Ledger & Analytics</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comprehensive audit trail tracking every single receipt, consumption, adjustment, and kitchen waste incident.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="p-6 rounded-3xl bg-[#0f172a]/90 border border-slate-800 hover:border-amber-500/40 transition-all shadow-xl space-y-3 group">
              <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 w-fit group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Role-Based Access Control</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enterprise security protecting executive data across Admin, Manager, Chef, Inventory Officer, and Cashier roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          HOW IT WORKS SECTION
          ───────────────────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 font-mono">
            Automated Architecture
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-royal text-white">
            How Shahi Diwan Automates Your Food Cost
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Eliminate manual inventory spreadsheets with automated closed-loop ingredient deduction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-3 relative">
            <span className="font-mono text-3xl font-extrabold text-amber-500/30">01</span>
            <h4 className="text-sm font-bold text-white">Stock In Procurement</h4>
            <p className="text-xs text-slate-400">
              Receive raw materials from suppliers with batch numbers, unit costs, and warehouse locations.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-3 relative">
            <span className="font-mono text-3xl font-extrabold text-amber-500/30">02</span>
            <h4 className="text-sm font-bold text-white">BOM Recipe Association</h4>
            <p className="text-xs text-slate-400">
              Dishes are linked with exact ingredient recipes down to individual grams and milliliters.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-3 relative">
            <span className="font-mono text-3xl font-extrabold text-amber-500/30">03</span>
            <h4 className="text-sm font-bold text-white">POS Order & KDS Dispatch</h4>
            <p className="text-xs text-slate-400">
              Waiters and cashiers fire tickets to the kitchen with real-time stock buffer validation.
            </p>
          </div>
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 space-y-3 relative">
            <span className="font-mono text-3xl font-extrabold text-amber-500/30">04</span>
            <h4 className="text-sm font-bold text-white">Automated Deduction</h4>
            <p className="text-xs text-slate-400">
              Marking orders served instantly deducts raw materials and logs audit transactions.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          CALL TO ACTION FOOTER BANNER
          ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl gold-gradient-bg text-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-royal tracking-tight">
              Ready to Upgrade Your Restaurant Operations?
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-900/80 max-w-xl">
              Join luxury dining establishments that trust Shahi Diwan Grand for precision inventory control.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-slate-950 text-white font-extrabold text-xs shadow-xl hover:bg-slate-900 transition transform active:scale-95"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-white/20 text-slate-950 font-bold text-xs border border-slate-950/20 hover:bg-white/30 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          FOOTER
          ───────────────────────────────────────────────────────────────────────── */}
      <footer className="mt-auto py-10 bg-[#070b14] border-t border-slate-800/80 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-royal font-bold text-white">Shahi Diwan Grand ERP</span>
            <span>• Luxury Hotel & Royal Dining System</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-amber-400 transition">
              About
            </Link>
            <Link href="/contact" className="hover:text-amber-400 transition">
              Contact
            </Link>
            <Link href="/login" className="hover:text-amber-400 transition">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-amber-400 transition">
              Register
            </Link>
          </div>
          <div>© {new Date().getFullYear()} Shahi Diwan Grand. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
