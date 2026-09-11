import React from 'react';

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
  const colorStyles = {
    amber: {
      bg: 'from-amber-50 to-white',
      border: 'border-amber-200 hover:border-amber-300',
      iconBg: 'bg-amber-100 text-amber-700 border border-amber-300',
      glow: 'group-hover:shadow-md',
    },
    emerald: {
      bg: 'from-emerald-50 to-white',
      border: 'border-emerald-200 hover:border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
      glow: 'group-hover:shadow-md',
    },
    blue: {
      bg: 'from-blue-50 to-white',
      border: 'border-blue-200 hover:border-blue-300',
      iconBg: 'bg-blue-100 text-blue-700 border border-blue-300',
      glow: 'group-hover:shadow-md',
    },
    purple: {
      bg: 'from-purple-50 to-white',
      border: 'border-purple-200 hover:border-purple-300',
      iconBg: 'bg-purple-100 text-purple-700 border border-purple-300',
      glow: 'group-hover:shadow-md',
    },
    rose: {
      bg: 'from-rose-50 to-white',
      border: 'border-rose-200 hover:border-rose-300',
      iconBg: 'bg-rose-100 text-rose-700 border border-rose-300',
      glow: 'group-hover:shadow-md',
    },
    slate: {
      bg: 'from-slate-50 to-white',
      border: 'border-slate-200 hover:border-slate-300',
      iconBg: 'bg-slate-100 text-slate-700 border border-slate-200',
      glow: 'group-hover:shadow-md',
    },
  };

  const currentStyle = colorStyles[color];

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${currentStyle.bg} bg-white border ${currentStyle.border} ${currentStyle.glow} shadow-xs transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                {badge}
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${currentStyle.iconBg}`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ml-auto flex items-center gap-1 ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
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
