import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-[2px] animate-spin">
          <div className="w-full h-full bg-[#0a0e1a] rounded-[14px]" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-royal text-xl font-bold gold-gradient-text">S</span>
        </div>
      </div>
      <p className="text-xs font-mono font-semibold text-amber-400 tracking-widest uppercase animate-pulse">
        Loading Shahi Diwan Grand ERP...
      </p>
    </div>
  );
}
