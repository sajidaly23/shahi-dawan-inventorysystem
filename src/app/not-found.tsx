import React from 'react';
import Link from 'next/link';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
        <Compass className="w-10 h-10 mx-auto animate-spin" style={{ animationDuration: '8s' }} />
      </div>
      <h1 className="text-4xl font-extrabold font-royal text-white">404</h1>
      <h2 className="text-lg font-bold text-slate-200">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested ERP route does not exist or has been relocated.
      </p>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient-bg text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition mt-2"
      >
        <Home className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
