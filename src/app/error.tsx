'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
        <AlertTriangle className="w-10 h-10 mx-auto" />
      </div>
      <h2 className="text-xl font-bold font-royal text-white">Application Exception</h2>
      <p className="text-xs text-slate-400 max-w-md">
        An unexpected error occurred while executing this operation. You can retry or return to the dashboard.
      </p>
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 hover:bg-slate-700 transition"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
