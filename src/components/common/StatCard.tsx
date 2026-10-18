import React from 'react';
import { useDb } from '../../context/DbContext';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose' | 'slate';
  badge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'amber',
  badge,
  onClick,
}) => {
  const { settings } = useDb();
  const isLight = settings?.theme === 'light';

  const darkColorStyles = {
    amber: {
      bg: 'from-amber-500/10 via-slate-900 to-[#0f172a]',
      border: 'border-amber-500/30 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      glow: 'hover:shadow-amber-500/10',
    },
    emerald: {
      bg: 'from-emerald-500/10 via-slate-900 to-[#0f172a]',
      border: 'border-emerald-500/30 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      glow: 'hover:shadow-emerald-500/10',
    },
    blue: {
      bg: 'from-blue-500/10 via-slate-900 to-[#0f172a]',
      border: 'border-blue-500/30 hover:border-blue-500/50',
      iconBg: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      glow: 'hover:shadow-blue-500/10',
    },
    purple: {
      bg: 'from-purple-500/10 via-slate-900 to-[#0f172a]',
      border: 'border-purple-500/30 hover:border-purple-500/50',
      iconBg: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      glow: 'hover:shadow-purple-500/10',
    },
    rose: {
      bg: 'from-rose-500/10 via-slate-900 to-[#0f172a]',
      border: 'border-rose-500/30 hover:border-rose-500/50',
      iconBg: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
      glow: 'hover:shadow-rose-500/10',
    },
    slate: {
      bg: 'from-slate-800/40 via-slate-900 to-[#0f172a]',
      border: 'border-slate-800 hover:border-slate-700',
      iconBg: 'bg-slate-800 text-slate-300 border border-slate-700',
      glow: 'hover:shadow-slate-500/10',
    },
  };

  const lightColorStyles = {
    amber: {
      bg: 'from-amber-50 to-white',
      border: 'border-amber-200 hover:border-amber-300',
      iconBg: 'bg-amber-100 text-amber-700 border border-amber-300',
      glow: 'hover:shadow-md',
    },
    emerald: {
      bg: 'from-emerald-50 to-white',
      border: 'border-emerald-200 hover:border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      glow: 'hover:shadow-md',
    },
    blue: {
      bg: 'from-blue-50 to-white',
      border: 'border-blue-200 hover:border-blue-300',
      iconBg: 'bg-blue-100 text-blue-700 border border-blue-300',
      glow: 'hover:shadow-md',
    },
    purple: {
      bg: 'from-purple-50 to-white',
      border: 'border-purple-200 hover:border-purple-300',
      iconBg: 'bg-purple-100 text-purple-700 border border-purple-300',
      glow: 'hover:shadow-md',
    },
    rose: {
      bg: 'from-rose-50 to-white',
      border: 'border-rose-200 hover:border-rose-300',
      iconBg: 'bg-rose-100 text-rose-700 border border-rose-300',
      glow: 'hover:shadow-md',
    },
    slate: {
      bg: 'from-slate-50 to-white',
      border: 'border-slate-200 hover:border-slate-300',
      iconBg: 'bg-slate-100 text-slate-700 border border-slate-200',
      glow: 'hover:shadow-md',
    },
  };

  const currentStyle = isLight ? lightColorStyles[color] : darkColorStyles[color];

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${
        currentStyle.bg
      } border ${currentStyle.border} ${currentStyle.glow} shadow-xl transition-all duration-300 backdrop-blur-xl ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isLight ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {title}
            </span>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {badge}
              </span>
            )}
          </div>
          <div
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight truncate ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${currentStyle.iconBg}`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div
          className={`mt-3 pt-3 border-t flex items-center justify-between text-xs ${
            isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
          }`}
        >
          {subtitle && <span className="truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ml-auto flex items-center gap-1 shrink-0 ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
