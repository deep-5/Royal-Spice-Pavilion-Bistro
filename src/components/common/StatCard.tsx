import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'teal' | 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'slate';
  onClick?: () => void;
  badge?: string;
  sparkline?: number[];
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  onClick,
  badge,
  sparkline = [20, 35, 25, 45, 38, 60, 52, 75]
}) => {
  // Generate smooth SVG sparkline path
  const min = Math.min(...sparkline);
  const max = Math.max(...sparkline) || 1;
  const range = max - min || 1;
  const width = 84;
  const height = 32;
  const points = sparkline.map((val, idx) => {
    const x = (idx / (sparkline.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const pathD = points.length > 1 ? `M ${points.join(' L ')}` : '';

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(245,118,75,0.08)] hover:border-[#f5764b]/40 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Top Header: Label & Icon */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-600 transition-colors">
          {title}
        </span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50/90 text-[#f5764b] border border-orange-100/60 shadow-2xs group-hover:bg-[#f5764b] group-hover:text-white transition-all duration-300">
          <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
        </div>
      </div>

      {/* Main Metric Value with Inline Mini Waveform Sparkline */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-gray-900 leading-tight">
          {value}
        </div>

        {/* Moniex-style Mini Sparkline Curve */}
        <div className="shrink-0 w-20 h-8 flex items-center justify-end">
          <svg width={width} height={height} className="overflow-visible">
            <defs>
              <linearGradient id={`sparkGrad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f5764b" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f5764b" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {pathD && (
              <>
                <path
                  d={`${pathD} L ${width},${height} L 0,${height} Z`}
                  fill={`url(#sparkGrad-${title.replace(/\s+/g, '')})`}
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke="#f5764b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Footer: Trend Pill & Subtitle */}
      <div className="mt-3.5 flex items-center justify-between gap-2 pt-2 border-t border-gray-50 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {trend ? (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                  : 'bg-red-50 text-red-600 border border-red-200/50'
              }`}
            >
              {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
          ) : badge ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-[#f5764b] border border-orange-200/50">
              {badge}
            </span>
          ) : null}

          {subtitle && (
            <span className="text-gray-500 text-[11px] font-medium truncate">
              {subtitle}
            </span>
          )}
        </div>

        {onClick && (
          <span className="text-[10px] font-bold text-[#f5764b] opacity-0 group-hover:opacity-100 transition-opacity">
            View →
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
