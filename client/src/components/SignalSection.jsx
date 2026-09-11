import React, { useState, useEffect, useRef } from 'react';
import { MapPin, AlertTriangle, Activity, BarChart3, Layers, Map, ArrowRight } from 'lucide-react';

export default function SignalSection() {
  const [activeMarker, setActiveMarker] = useState(0);
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      
      // If the section is in the viewport
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = elementCenter - viewportCenter;
        
        animationFrameId = requestAnimationFrame(() => {
          if (bgRef.current) bgRef.current.style.transform = `translateY(${offset * 0.25}px)`;
          if (leftRef.current) leftRef.current.style.transform = `translateY(${offset * 0.1}px)`;
          if (rightRef.current) rightRef.current.style.transform = `translateY(${offset * -0.15}px)`;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    
    const interval = setInterval(() => {
      setActiveMarker((prev) => (prev + 1) % 3);
    }, 4000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const stats = [
    { label: "Issues Detected", value: "1,204", change: "↑ 12%", trendColor: "text-red-400" },
    { label: "Avg Resolution", value: "4.2h", change: "↓ 8%", trendColor: "text-green-400" },
    { label: "Active Signals", value: "45", change: "Steady", trendColor: "text-gray-400" },
  ];

  const markerData = [
    {
      title: "Pothole Detected",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#4F8CFF]" />,
      dept: "Roads Department",
      reports: "3 duplicates",
      status: "Verifying",
      priority: "Medium"
    },
    {
      title: "High Priority Alert",
      icon: <Activity className="w-3.5 h-3.5 text-[#7C5CFC]" />,
      dept: "Emergency Services",
      reports: "Multiple calls",
      status: "Dispatched",
      priority: "Critical"
    },
    {
      title: "Signal Outage",
      icon: <Map className="w-3.5 h-3.5 text-[#4F8CFF]" />,
      dept: "Traffic Control",
      reports: "5 related issues",
      status: "Investigating",
      priority: "High"
    }
  ];

  const currentMarker = markerData[activeMarker];

  return (
    <section ref={sectionRef} className="sticky top-0 min-h-screen flex items-center justify-center w-full py-20 lg:py-28 overflow-hidden bg-[#080B12] border-t border-white/[0.02] z-0">
      {/* Background glowing effects */}
      <div 
        ref={bgRef}
        className="absolute inset-0 pointer-events-none will-change-transform"
      >
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#4F8CFF]/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#7C5CFC]/10 blur-[150px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Content */}
          <div 
            ref={leftRef}
            className="flex flex-col max-w-xl animate-fade-in will-change-transform"
          >
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#4F8CFF]/20 bg-[#4F8CFF]/[0.08] px-3.5 py-1.5 backdrop-blur-sm w-fit">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4F8CFF] opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4F8CFF]"></span>
              </span>
              <span className="text-[11px] font-semibold tracking-wide text-[#4F8CFF] uppercase">Live Intelligence</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Your City Has a <br className="hidden sm:block"/>
              <span className="relative inline-block mt-1">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFC] relative z-10">
                  Signal.
                </span>
                <span className="absolute -bottom-1 left-0 h-2 w-full rounded-full bg-[#7C5CFC]/20" />
              </span>
            </h2>
            
            <p className="mt-5 text-base sm:text-lg text-gray-400 leading-relaxed font-light">
              We turn scattered civic complaints into a unified, real-time map of urban intelligence. Pinpoint priority issues before they escalate, coordinate departments, and save valuable time.
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-white/[0.06]">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col group">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-[#4F8CFF] transition-colors duration-300">
                    {stat.value}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">{stat.label}</span>
                  </div>
                  <span className={`text-[10px] font-medium mt-0.5 ${stat.trendColor}`}>
                    {stat.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Map/Visual (Now Dashboard Visual) */}
          <div 
            ref={rightRef}
            className="w-full flex items-center justify-center will-change-transform"
          >
            <div className="relative origin-center transform scale-[0.9] sm:scale-95 lg:scale-100 w-full max-w-lg mx-auto">
              {/* Main dashboard card */}
              <div className="relative rounded-2xl border border-slate-200/20 bg-slate-900/40 backdrop-blur-xl p-1.5 shadow-2xl shadow-black/40">
                {/* Window chrome */}
                <div className="flex items-center gap-2 rounded-t-xl bg-slate-800/80 px-4 py-3 border-b border-slate-700">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="ml-3 flex items-center gap-2 rounded-md bg-slate-900/80 border border-slate-700 px-3 py-1 flex-1 max-w-xs">
                    <div className="h-3 w-3 rounded-full bg-slate-600" />
                    <span className="text-[10px] text-slate-400 font-medium">smartcity.dashboard/analytics</span>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="rounded-b-xl bg-gradient-to-br from-slate-900/90 to-[#0F141D]/90 p-4 sm:p-5">
                  {/* Top stats row */}
                  <div className="grid grid-cols-4 gap-2.5 mb-4">
                    {[
                      { label: 'Active Issues', value: '247', dot: 'bg-brand-500', trend: '↑ 12%', trendColor: 'text-brand-400' },
                      { label: 'Resolved Today', value: '38', dot: 'bg-teal-500', trend: '↑ 8%', trendColor: 'text-teal-400' },
                      { label: 'Avg Response', value: '2.4h', dot: 'bg-amber-500', trend: '↓ 15%', trendColor: 'text-emerald-400' },
                      { label: 'Satisfaction', value: '94%', dot: 'bg-emerald-500', trend: '↑ 3%', trendColor: 'text-emerald-400' },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-slate-800/50 p-3 shadow-sm border border-slate-700/80 hover:bg-slate-800 transition-colors duration-200">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${stat.dot}`} />
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">{stat.label}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base sm:text-lg font-bold text-slate-200">{stat.value}</span>
                          <span className={`text-[9px] font-semibold ${stat.trendColor}`}>{stat.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Map area */}
                  <div className="relative mb-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-[#141A24]/60 border border-slate-700/40 h-44 sm:h-48 overflow-hidden">
                    {/* Grid lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
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
                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 rounded-lg bg-slate-900/90 backdrop-blur-sm px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 shadow-sm border border-slate-700/60">
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
                    <div className="rounded-xl bg-slate-800/50 p-3 shadow-sm border border-slate-700/80">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-semibold text-slate-400">Issues by Category</span>
                        <span className="text-[9px] font-medium text-brand-400">This Week</span>
                      </div>
                      <div className="flex items-end gap-[5px] h-14">
                        {[55, 40, 75, 30, 65, 20, 50].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-sm bg-gradient-to-t from-brand-500 to-brand-300 opacity-90 hover:opacity-100 transition-opacity"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Donut chart */}
                    <div className="rounded-xl bg-slate-800/50 p-3 shadow-sm border border-slate-700/80">
                      <div className="text-[10px] font-semibold text-slate-400 mb-2.5">Resolution Rate</div>
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 shrink-0">
                          <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="13" fill="none" stroke="#334155" strokeWidth="3" />
                            <circle
                              cx="18" cy="18" r="13"
                              fill="none"
                              stroke="url(#heroGradDark)"
                              strokeWidth="3"
                              strokeDasharray="76.8 81.7"
                              strokeLinecap="round"
                            />
                            <defs>
                              <linearGradient id="heroGradDark" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#2dd4bf" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-slate-200">94%</span>
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-brand-500 shrink-0" />
                            <span className="text-[10px] text-slate-400 truncate">Resolved</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-teal-400 shrink-0" />
                            <span className="text-[10px] text-slate-400 truncate">In Progress</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-slate-600 shrink-0" />
                            <span className="text-[10px] text-slate-400 truncate">Pending</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card — left */}
              <div className="absolute -left-4 top-[28%] hidden rounded-xl bg-slate-800 p-3 shadow-xl shadow-black/40 border border-slate-700 animate-float lg:block z-20">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/20">
                    <Activity className="h-4 w-4 text-teal-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-slate-400">AI Classified</div>
                    <div className="text-xs font-bold text-slate-200">Pothole — <span className="text-red-400">High</span></div>
                  </div>
                </div>
              </div>

              {/* Floating card — right */}
              <div className="absolute -right-3 bottom-[22%] hidden rounded-xl bg-slate-800 p-3 shadow-xl shadow-black/40 border border-slate-700 animate-float-delayed lg:block z-20">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-slate-400">Resolution Time</div>
                    <div className="text-xs font-bold text-emerald-400">↓ 45% Faster</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
