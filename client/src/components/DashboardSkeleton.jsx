import React from 'react';

/**
 * Atomic Skeleton Box Primitive
 */
export function SkeletonBox({ className = '', style = {} }) {
  return (
    <div
      className={`civic-skeleton rounded-md ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Stat Card Skeleton matching CivicStatCard layout with Circular Gauge
 */
export function StatCardSkeleton() {
  return (
    <div
      className="civic-stat-card relative overflow-hidden rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs"
      aria-hidden="true"
    >
      {/* Top accent bar placeholder */}
      <div className="civic-skeleton absolute top-0 left-0 right-0 h-[3px] opacity-70" />

      {/* Header row: title and icon */}
      <div className="flex items-center justify-between gap-3 mb-3.5">
        <SkeletonBox className="h-3 w-24 rounded" />
        <SkeletonBox className="w-9 h-9 rounded-xl" />
      </div>

      {/* Metric value & circular gauge row */}
      <div className="flex items-center justify-between gap-3 my-2">
        <SkeletonBox className="h-9 w-28 rounded-lg" />
        {/* Circular Gauge Skeleton Ring */}
        <div className="relative w-[52px] h-[52px] rounded-full border-4 border-slate-200 flex items-center justify-center shrink-0">
          <SkeletonBox className="w-4 h-4 rounded-full" />
        </div>
      </div>

      {/* Telemetry footer: pill and subtitle */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
        <SkeletonBox className="h-4 w-20 rounded-md" />
        <SkeletonBox className="h-3 w-24 rounded" />
      </div>
    </div>
  );
}

/**
 * High-Fidelity Dashboard Skeleton Screen
 * Perfectly mirrors the live dashboard layout: persistent sidebar, top navigation bar,
 * executive telemetry stat cards with circular gauges, and main operational panel.
 */
export function DashboardSkeleton({
  role = 'admin', // 'admin' | 'citizen' | 'worker'
  statCardCount = 4,
  sidebarItemCount = 6,
}) {
  return (
    <main
      className="dashboard-page min-h-screen bg-slate-50 text-slate-900 select-none pointer-events-none"
      aria-busy="true"
      aria-live="polite"
    >
      {/* Persistent Full-Height Sidebar Skeleton */}
      <aside className="dashboard-sidebar">
        {/* Brand Header Skeleton */}
        <div className="dashboard-sidebar-brand">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl civic-skeleton-dark shrink-0" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded civic-skeleton-dark" />
              <div className="h-2 w-16 rounded civic-skeleton-dark opacity-60" />
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Items Skeleton */}
        <div className="dashboard-sidebar-scroll mt-4 space-y-2">
          <div className="h-2.5 w-20 rounded civic-skeleton-dark opacity-40 ml-2 mb-3" />
          {Array.from({ length: sidebarItemCount }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5"
            >
              <div className="w-4 h-4 rounded civic-skeleton-dark shrink-0" />
              <div
                className="h-3 rounded civic-skeleton-dark"
                style={{ width: `${60 + (i % 3) * 20}%` }}
              />
            </div>
          ))}
        </div>

        {/* Sidebar Footer Skeleton */}
        <div className="dashboard-sidebar-footer mt-auto pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-4 h-4 rounded civic-skeleton-dark shrink-0" />
            <div className="h-3 w-28 rounded civic-skeleton-dark" />
          </div>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-4 h-4 rounded civic-skeleton-dark shrink-0" />
            <div className="h-3 w-16 rounded civic-skeleton-dark" />
          </div>
        </div>
      </aside>

      {/* Main Content Workspace Skeleton */}
      <section className="dashboard-main">
        {/* Topbar Skeleton */}
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left flex items-center gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-4 w-44 rounded-md" />
                <SkeletonBox className="h-5 w-28 rounded-full" />
              </div>
              <SkeletonBox className="h-2.5 w-64 rounded" />
            </div>
          </div>

          <div className="dashboard-topbar-right flex items-center gap-3">
            <SkeletonBox className="hidden sm:block h-8 w-24 rounded-lg" />
            <div className="flex items-center gap-2 p-1 rounded-xl">
              <SkeletonBox className="w-8 h-8 rounded-full" />
              <SkeletonBox className="hidden md:block h-3 w-20 rounded" />
            </div>
            <SkeletonBox className="h-8 w-16 rounded-lg" />
          </div>
        </header>

        {/* Dynamic Workspace Container Skeleton */}
        <div className="dashboard-container space-y-6">
          {/* Heading Row Skeleton */}
          <div className="dashboard-heading-row flex flex-col gap-2">
            <SkeletonBox className="h-3 w-32 rounded" />
            <SkeletonBox className="h-7 sm:h-8 w-72 rounded-lg" />
            <SkeletonBox className="h-3.5 w-full max-w-2xl rounded" />
          </div>

          {/* 4 Stat Cards Skeleton Grid with Circular Gauges */}
          <div className="dashboard-stat-grid">
            {Array.from({ length: statCardCount }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>

          {/* Secondary Command Pods Skeleton (For Admin/Overview) */}
          {role === 'admin' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-white"
                >
                  <SkeletonBox className="w-9 h-9 rounded-lg shrink-0" />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <SkeletonBox className="h-3 w-20 rounded" />
                    <SkeletonBox className="h-2 w-14 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Large Main Panel Skeleton (Dispatch Queue / Recent Activity Table) */}
          <section className="dashboard-panel p-6 space-y-4">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="space-y-1.5">
                <SkeletonBox className="h-4 w-48 rounded" />
                <SkeletonBox className="h-3 w-72 rounded" />
              </div>
              <SkeletonBox className="h-8 w-28 rounded-lg" />
            </div>

            {/* Panel Content Placeholders: 4 Shimmer Rows */}
            <div className="space-y-3 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <SkeletonBox className="h-4 w-20 rounded-full" />
                      <SkeletonBox className="h-4 w-16 rounded-full" />
                      <SkeletonBox className="h-3 w-28 rounded" />
                    </div>
                    <SkeletonBox className="h-4 w-3/4 rounded" />
                    <SkeletonBox className="h-3 w-1/2 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <SkeletonBox className="h-8 w-24 rounded-lg" />
                    <SkeletonBox className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default DashboardSkeleton;
