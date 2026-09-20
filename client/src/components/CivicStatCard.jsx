import React, { useState, useEffect } from 'react';
import { ArrowRight, TrendingUp, TrendingDown, Activity } from 'lucide-react';

/**
 * Animated Circular Radial Progress Graph (Civic Gauge)
 * Precision SVG with stroke-dashoffset motion, linear radiant gradients,
 * glowing drop-shadows, and smooth state transitions.
 */
export function CivicCircularGauge({
  percentage = 0,
  size = 56,
  strokeWidth = 5,
  variant = 'blue',
  showText = true,
  label = null,
  animate = true,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(timer);
  }, []);

  // Clamp percentage between 0 and 100
  const validPercent = Math.min(100, Math.max(0, Number(percentage) || 0));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate animated offset
  const strokeDashoffset = mounted && animate
    ? circumference - (validPercent / 100) * circumference
    : circumference;

  const colorConfigs = {
    blue: {
      gradient: ['#2563EB', '#60A5FA'],
      glow: '#3B82F6',
      track: '#E2E8F0',
      text: '#1D4ED8',
      bgGlow: 'rgba(59, 130, 246, 0.12)',
    },
    emerald: {
      gradient: ['#059669', '#34D399'],
      glow: '#10B981',
      track: '#E2E8F0',
      text: '#047857',
      bgGlow: 'rgba(16, 185, 129, 0.12)',
    },
    amber: {
      gradient: ['#D97706', '#FBBF24'],
      glow: '#F59E0B',
      track: '#E2E8F0',
      text: '#B45309',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
    },
    rose: {
      gradient: ['#DC2626', '#F87171'],
      glow: '#EF4444',
      track: '#E2E8F0',
      text: '#B91C1C',
      bgGlow: 'rgba(239, 68, 68, 0.12)',
    },
    red: {
      gradient: ['#DC2626', '#F87171'],
      glow: '#EF4444',
      track: '#E2E8F0',
      text: '#B91C1C',
      bgGlow: 'rgba(239, 68, 68, 0.12)',
    },
    indigo: {
      gradient: ['#4338CA', '#818CF8'],
      glow: '#6366F1',
      track: '#E2E8F0',
      text: '#3730A3',
      bgGlow: 'rgba(99, 102, 241, 0.12)',
    },
    purple: {
      gradient: ['#7C3AED', '#C084FC'],
      glow: '#8B5CF6',
      track: '#E2E8F0',
      text: '#6D28D9',
      bgGlow: 'rgba(139, 92, 246, 0.12)',
    },
  };

  const config = colorConfigs[variant] || colorConfigs.blue;
  const gradientId = `civic-grad-${variant}`;

  return (
    <div
      className="civic-circular-graph-container relative inline-flex items-center justify-center shrink-0 group/gauge"
      style={{ width: size, height: size }}
      title={`${Math.round(validPercent)}% progress`}
    >
      {/* Ambient glowing backdrop */}
      <div
        className="absolute inset-0 rounded-full blur-md opacity-40 group-hover/gauge:opacity-75 transition-opacity duration-300 pointer-events-none"
        style={{ background: config.bgGlow }}
      />

      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 origin-center transition-transform duration-300 group-hover/gauge:scale-105"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.gradient[0]} />
            <stop offset="100%" stopColor={config.gradient[1]} />
          </linearGradient>
          <filter id={`glow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor={config.glow} floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Outer Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={config.track}
          strokeWidth={strokeWidth}
          className="opacity-60 transition-opacity duration-300"
        />

        {/* Dynamic Animated Radial Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter={`url(#glow-${variant})`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Center Label / Percentage */}
      {showText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span
            className="text-[11px] font-extrabold tabular-nums tracking-tight leading-none transition-transform duration-200 group-hover/gauge:scale-110"
            style={{ color: config.text }}
          >
            {label !== null ? label : `${Math.round(validPercent)}%`}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Handcrafted Civic Intelligence Stat Card
 * Featuring animated circular telemetry graphs, ambient radiant glows,
 * real-time status beacons, and interactive micro-motion.
 */
export function CivicStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
  percentage = undefined,
  gaugeLabel = null,
  trend = null,
  trendType = 'positive', // 'positive' | 'negative' | 'neutral' | 'live'
  actionText = null,
  onAction = null,
  href = null,
  isLive = false,
  badgeText = null,
  className = '',
}) {
  const variantGradients = {
    blue: {
      bar: 'from-blue-600 via-blue-500 to-indigo-500',
      ambient: 'rgba(37, 99, 235, 0.07)',
      borderHover: 'hover:border-blue-400/60',
      iconBox: 'bg-blue-50/90 text-blue-600 border-blue-200/70',
      valueColor: 'text-slate-900',
      accentColor: '#2563EB',
    },
    emerald: {
      bar: 'from-emerald-600 via-emerald-500 to-teal-500',
      ambient: 'rgba(16, 185, 129, 0.07)',
      borderHover: 'hover:border-emerald-400/60',
      iconBox: 'bg-emerald-50/90 text-emerald-600 border-emerald-200/70',
      valueColor: 'text-emerald-700',
      accentColor: '#059669',
    },
    amber: {
      bar: 'from-amber-500 via-amber-400 to-orange-500',
      ambient: 'rgba(245, 158, 11, 0.07)',
      borderHover: 'hover:border-amber-400/60',
      iconBox: 'bg-amber-50/90 text-amber-600 border-amber-200/70',
      valueColor: 'text-amber-700',
      accentColor: '#D97706',
    },
    rose: {
      bar: 'from-rose-600 via-red-500 to-rose-400',
      ambient: 'rgba(239, 68, 68, 0.07)',
      borderHover: 'hover:border-rose-400/60',
      iconBox: 'bg-rose-50/90 text-rose-600 border-rose-200/70',
      valueColor: 'text-rose-700',
      accentColor: '#DC2626',
    },
    red: {
      bar: 'from-rose-600 via-red-500 to-rose-400',
      ambient: 'rgba(239, 68, 68, 0.07)',
      borderHover: 'hover:border-rose-400/60',
      iconBox: 'bg-rose-50/90 text-rose-600 border-rose-200/70',
      valueColor: 'text-rose-700',
      accentColor: '#DC2626',
    },
    indigo: {
      bar: 'from-indigo-600 via-indigo-500 to-purple-500',
      ambient: 'rgba(99, 102, 241, 0.07)',
      borderHover: 'hover:border-indigo-400/60',
      iconBox: 'bg-indigo-50/90 text-indigo-600 border-indigo-200/70',
      valueColor: 'text-indigo-950',
      accentColor: '#4F46E5',
    },
    purple: {
      bar: 'from-purple-600 via-violet-500 to-fuchsia-500',
      ambient: 'rgba(139, 92, 246, 0.07)',
      borderHover: 'hover:border-purple-400/60',
      iconBox: 'bg-purple-50/90 text-purple-600 border-purple-200/70',
      valueColor: 'text-purple-700',
      accentColor: '#7C3AED',
    },
  };

  const vConfig = variantGradients[variant] || variantGradients.blue;

  const CardWrapper = href ? 'a' : 'div';
  const wrapperProps = href
    ? { href, className: 'block no-underline' }
    : {};

  return (
    <CardWrapper {...wrapperProps}>
      <div
        className={`civic-stat-card group relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/85 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl ${vConfig.borderHover} ${className}`}
        style={{
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px -1px rgba(15, 23, 42, 0.02)',
        }}
      >
        {/* Top Accent Gradient Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${vConfig.bar} opacity-90 group-hover:opacity-100 transition-opacity duration-300`}
        />

        {/* Ambient Corner Gradient Glow */}
        <div
          className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-100 opacity-60"
          style={{ background: vConfig.ambient }}
        />

        {/* Subtle Watermark Civic Mesh Pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.015] [background-image:radial-gradient(#091428_1px,transparent_1px)] [background-size:12px_12px]" />

        {/* Header Row: Title, Badges & Icon */}
        <div className="relative flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">
              {title}
            </span>

            {/* Live Telemetry Beacon Indicator */}
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[9px] font-extrabold tracking-wider uppercase text-emerald-700 shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
                Live
              </span>
            )}

            {/* Optional Context Badge */}
            {badgeText && !isLive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                {badgeText}
              </span>
            )}
          </div>

          {/* Bespoke Civic Icon Housing */}
          {Icon && (
            <div
              className={`civic-stat-icon-wrap flex items-center justify-center w-9 h-9 rounded-xl border transition-transform duration-300 ease-out group-hover:scale-110 group-hover:rotate-2 shadow-2xs ${vConfig.iconBox}`}
            >
              <Icon size={18} />
            </div>
          )}
        </div>

        {/* Metric Value & Circular Radial Graph Row */}
        <div className="relative flex items-center justify-between gap-3 my-2">
          <div className="min-w-0">
            <span
              className={`block text-3xl sm:text-[34px] font-black tracking-tight font-sans leading-none tabular-nums ${vConfig.valueColor}`}
            >
              {value}
            </span>
          </div>

          {/* Embedded Circular Radial Graph */}
          {percentage !== undefined && (
            <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
              <CivicCircularGauge
                percentage={percentage}
                variant={variant}
                size={54}
                strokeWidth={4.5}
                label={gaugeLabel}
              />
            </div>
          )}
        </div>

        {/* Telemetry Footer: Trend Pill, Subtitle & Action */}
        <div className="relative flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            {/* Trend Micro-Pill */}
            {trend && (
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                  trendType === 'positive'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : trendType === 'negative'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                    : trendType === 'live'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {trendType === 'positive' && <TrendingUp size={11} className="text-emerald-600" />}
                {trendType === 'negative' && <TrendingDown size={11} className="text-rose-600" />}
                {trendType === 'live' && <Activity size={11} className="text-indigo-600 animate-pulse" />}
                <span>{trend}</span>
              </span>
            )}

            {/* Subtitle Description */}
            {subtitle && (
              <span className="text-slate-500 font-medium truncate text-[11px]">
                {subtitle}
              </span>
            )}
          </div>

          {/* Action Link / Micro-Button */}
          {actionText && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-800 transition-colors duration-150 cursor-pointer text-[11px] group/btn shrink-0"
            >
              <span>{actionText}</span>
              <ArrowRight
                size={12}
                className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
              />
            </button>
          )}
        </div>
      </div>
    </CardWrapper>
  );
}

export default CivicStatCard;
