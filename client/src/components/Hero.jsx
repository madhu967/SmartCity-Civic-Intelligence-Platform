import { ArrowRight, Play, Shield, Zap, TrendingUp } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white pt-28 pb-16 lg:pt-36 lg:pb-24">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute -left-48 top-20 h-[500px] w-[500px] rounded-full bg-brand-100/30 blur-[100px]" />
        <div className="absolute -right-48 top-40 h-[400px] w-[400px] rounded-full bg-sky-100/40 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[600px] rounded-full bg-teal-50/40 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          {/* Left Content */}
          <div className="max-w-xl animate-slide-up">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-brand-200/60 bg-brand-50/60 px-4 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-brand-700">
                AI-Powered Civic Intelligence Platform
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-5xl xl:text-[3.25rem]">
              Building{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-brand-700 via-brand-600 to-sky-500 bg-clip-text text-transparent">
                  Smarter Cities
                </span>
                <span className="absolute -bottom-1 left-0 h-3 w-full rounded-full bg-brand-100/70" />
              </span>
              <br />
              One Report at a Time
            </h1>

            {/* Description */}
            <p className="mt-6 text-base leading-relaxed text-slate-500 sm:text-lg sm:leading-relaxed">
              Empower citizens to report civic issues instantly. Our AI analyzes,
              prioritizes, and routes problems to the right department — turning
              complaints into action within hours, not weeks.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#report"
                className="group inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-brand-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-2xl hover:shadow-brand-600/30 active:translate-y-0"
              >
                Report an Issue
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="#demo"
                className="group inline-flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg active:translate-y-0"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 transition-colors duration-200 group-hover:bg-brand-50">
                  <Play className="ml-0.5 h-3 w-3 text-slate-600 group-hover:text-brand-600" fill="currentColor" />
                </span>
                Watch Demo
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-slate-100 pt-8">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-teal-500" />
                <span className="text-sm font-medium text-slate-400">Trusted by 50+ Cities</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-slate-400">2hr Avg. Response</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-500" />
                <span className="text-sm font-medium text-slate-400">94% Resolution Rate</span>
              </div>
            </div>
          </div>

          {/* Right — Dashboard Visual */}
          <div className="relative animate-fade-in lg:ml-auto max-w-lg mx-auto origin-center lg:origin-right transform scale-90 sm:scale-95 lg:scale-90 xl:scale-95" style={{ animationDelay: '0.3s' }}>
            {/* Main dashboard card */}
            <div className="relative rounded-2xl border border-slate-200/70 bg-white p-1.5 shadow-2xl shadow-slate-900/[0.08]">
              {/* Window chrome */}
              <div className="flex items-center gap-2 rounded-t-xl bg-slate-50/80 px-4 py-3 border-b border-slate-100">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="ml-3 flex items-center gap-2 rounded-md bg-white/80 border border-slate-100 px-3 py-1 flex-1 max-w-xs">
                  <div className="h-3 w-3 rounded-full bg-slate-200" />
                  <span className="text-[10px] text-slate-400 font-medium">smartcity.dashboard/analytics</span>
                </div>
              </div>

              {/* Dashboard content */}
              <div className="rounded-b-xl bg-gradient-to-br from-slate-50/50 to-brand-50/20 p-4 sm:p-5">
                {/* Top stats row */}
                <div className="grid grid-cols-4 gap-2.5 mb-4">
                  {[
                    { label: 'Active Issues', value: '247', dot: 'bg-brand-500', trend: '↑ 12%', trendColor: 'text-brand-600' },
                    { label: 'Resolved Today', value: '38', dot: 'bg-teal-500', trend: '↑ 8%', trendColor: 'text-teal-600' },
                    { label: 'Avg Response', value: '2.4h', dot: 'bg-amber-500', trend: '↓ 15%', trendColor: 'text-emerald-600' },
                    { label: 'Satisfaction', value: '94%', dot: 'bg-emerald-500', trend: '↑ 3%', trendColor: 'text-emerald-600' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-white p-3 shadow-sm border border-slate-100/80 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${stat.dot}`} />
                        <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">{stat.label}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-bold text-slate-800">{stat.value}</span>
                        <span className={`text-[9px] font-semibold ${stat.trendColor}`}>{stat.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map area */}
                <div className="relative mb-4 rounded-xl bg-gradient-to-br from-brand-50/80 to-sky-50/60 border border-brand-100/40 h-44 sm:h-48 overflow-hidden">
                  {/* Grid lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.04)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  {/* Roads */}
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                    <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(148,163,184,0.15)" strokeWidth="2" />
                    <line x1="30%" y1="0" x2="30%" y2="100%" stroke="rgba(148,163,184,0.15)" strokeWidth="2" />
                    <line x1="65%" y1="0" x2="65%" y2="100%" stroke="rgba(148,163,184,0.15)" strokeWidth="2" />
                    <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
                    <line x1="10%" y1="75%" x2="90%" y2="75%" stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
                    <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="rgba(148,163,184,0.1)" strokeWidth="1" />
                  </svg>
                  {/* Issue markers */}
                  <div className="absolute top-7 left-[15%] h-3 w-3 rounded-full bg-red-400 ring-[3px] ring-red-400/20 animate-pulse" />
                  <div className="absolute top-[35%] left-[38%] h-3 w-3 rounded-full bg-amber-400 ring-[3px] ring-amber-400/20" />
                  <div className="absolute top-[45%] right-[28%] h-3 w-3 rounded-full bg-teal-400 ring-[3px] ring-teal-400/20" />
                  <div className="absolute bottom-[30%] left-[22%] h-3 w-3 rounded-full bg-brand-400 ring-[3px] ring-brand-400/20 animate-pulse" />
                  <div className="absolute top-[20%] right-[15%] h-3 w-3 rounded-full bg-emerald-400 ring-[3px] ring-emerald-400/20" />
                  <div className="absolute bottom-[20%] right-[35%] h-2.5 w-2.5 rounded-full bg-red-400 ring-[3px] ring-red-400/20" />
                  <div className="absolute top-[60%] left-[55%] h-2.5 w-2.5 rounded-full bg-orange-400 ring-[3px] ring-orange-400/20" />
                  {/* Live indicator */}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-lg bg-white/90 backdrop-blur-sm px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm border border-slate-100/60">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Live City Map
                  </div>
                </div>

                {/* Bottom charts */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Bar chart */}
                  <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-100/80">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-semibold text-slate-400">Issues by Category</span>
                      <span className="text-[9px] font-medium text-brand-500">This Week</span>
                    </div>
                    <div className="flex items-end gap-[5px] h-14">
                      {[55, 40, 75, 30, 65, 20, 50].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-gradient-to-t from-brand-600 to-brand-400 opacity-90 hover:opacity-100 transition-opacity"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Donut chart */}
                  <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-100/80">
                    <div className="text-[10px] font-semibold text-slate-400 mb-2.5">Resolution Rate</div>
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 shrink-0">
                        <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="13" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                          <circle
                            cx="18" cy="18" r="13"
                            fill="none"
                            stroke="url(#heroGrad)"
                            strokeWidth="3"
                            strokeDasharray="76.8 81.7"
                            strokeLinecap="round"
                          />
                          <defs>
                            <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#2563eb" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-700">94%</span>
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                          <span className="text-[10px] text-slate-500 truncate">Resolved</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-teal-400 shrink-0" />
                          <span className="text-[10px] text-slate-500 truncate">In Progress</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-slate-200 shrink-0" />
                          <span className="text-[10px] text-slate-500 truncate">Pending</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card — left */}
            <div className="absolute -left-4 top-[28%] hidden rounded-xl bg-white p-3 shadow-xl shadow-slate-900/[0.06] border border-slate-100 animate-float lg:block">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50">
                  <Zap className="h-4 w-4 text-teal-500" />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-400">AI Classified</div>
                  <div className="text-xs font-bold text-slate-700">Pothole — <span className="text-red-500">High</span></div>
                </div>
              </div>
            </div>

            {/* Floating card — right */}
            <div className="absolute -right-3 bottom-[22%] hidden rounded-xl bg-white p-3 shadow-xl shadow-slate-900/[0.06] border border-slate-100 animate-float-delayed lg:block">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-400">Resolution Time</div>
                  <div className="text-xs font-bold text-emerald-600">↓ 45% Faster</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
