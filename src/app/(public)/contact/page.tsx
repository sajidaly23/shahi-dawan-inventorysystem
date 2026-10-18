'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
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
        <div className="space-y-3 text-center max-w-xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">Contact & Support</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-royal text-white">
            Connect with Our Hospitality Specialists
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Have questions about integrating Shahi Diwan Grand ERP into your restaurant or hotel? Our team is available 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 text-center space-y-2">
            <Phone className="w-6 h-6 text-amber-400 mx-auto" />
            <h4 className="text-xs font-bold uppercase text-slate-300">Direct Telephone</h4>
            <p className="text-xs font-mono text-white">+92 51 8844990</p>
          </div>
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 text-center space-y-2">
            <Mail className="w-6 h-6 text-amber-400 mx-auto" />
            <h4 className="text-xs font-bold uppercase text-slate-300">Executive Email</h4>
            <p className="text-xs font-mono text-white">support@shahidiwan.com</p>
          </div>
          <div className="p-6 rounded-3xl bg-[#0f172a] border border-slate-800 text-center space-y-2">
            <MapPin className="w-6 h-6 text-amber-400 mx-auto" />
            <h4 className="text-xs font-bold uppercase text-slate-300">Headquarters</h4>
            <p className="text-xs text-white">Mall Road & Royal Ave, F-7, Islamabad</p>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-[#0f172a] border border-slate-800 max-w-xl mx-auto space-y-4">
          <h3 className="text-base font-bold text-white font-royal">Send Us a Direct Message</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert('Thank you for contacting Shahi Diwan Grand ERP support. Our team will contact you shortly.');
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Manager / General Director"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="manager@restaurant.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Message / Requirements</label>
              <textarea
                rows={3}
                required
                placeholder="Tell us about your restaurant capacity and ERP requirements..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl gold-gradient-bg text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
