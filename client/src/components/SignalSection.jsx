import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  Activity, 
  BarChart3, 
  Map, 
  Play, 
  Pause, 
  ShieldCheck, 
  Sparkles, 
  Cpu, 
  Radio, 
  CheckCircle2, 
  Zap
} from 'lucide-react';

export default function SignalSection() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const chromeCardRef = useRef(null);
  const chromeProgressRef = useRef(null);
  const progressBarRef = useRef(null);

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [activeMarker, setActiveMarker] = useState(0);

  // Check if route loaded with ?card (gallery card mode without page scroll)
  const [isCardRoute, setIsCardRoute] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.has('card') || window.location.hash.includes('card');
  });

  const autoPlayStartRef = useRef(0);
  const isAutoPlayingRef = useRef(isAutoPlaying || isCardRoute);

  useEffect(() => {
    isAutoPlayingRef.current = isAutoPlaying || isCardRoute;
    if (isAutoPlayingRef.current) {
      autoPlayStartRef.current = performance.now();
    }
  }, [isAutoPlaying, isCardRoute]);

  // Marker rotation in Card 0 map
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMarker((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Card stack animation timeline & rAF loop
  useEffect(() => {
    let rAFId;
    let lastP = -1;

    const prefersReducedMotion = 
      typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lerp = (a, b, t) => a + (b - a) * t;

    const applyTransforms = (p) => {
      // 3 peel transitions (Card 0 -> Card 1 -> Card 2 -> Card 3) so Card 3 rests in full focus at p = 1
      const numTransitions = 3;
      const segment = 1 / numTransitions;
      const active = Math.min(Math.floor(p / segment), numTransitions - 1);
      const segP = Math.max(0, Math.min(1, (p - active * segment) / segment));

      for (let i = 0; i < 4; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;

        let transformStr = '';
        let opacity = 1;

        if (prefersReducedMotion) {
          // Honour prefers-reduced-motion: hold the resting stack
          const y = -50 + i * 5;
          const scale = 1 - i * 0.075;
          transformStr = `translate(-50%, ${y}%) scale(${scale}) rotateX(0deg)`;
          opacity = 1;
        } else if (i < active) {
          // Parked above
          transformStr = 'translate(-50%, -250%) rotateX(35deg)';
          opacity = 0;
        } else if (i === active) {
          // Peeling up and tilting away on its bottom edge
          const y = lerp(-50, -200, segP);
          const rotX = lerp(0, 35, segP);
          transformStr = `translate(-50%, ${y.toFixed(2)}%) rotateX(${rotX.toFixed(2)}deg) scale(1)`;
          opacity = segP > 0.92 ? Math.max(0, 1 - (segP - 0.92) / 0.08) : 1;
        } else {
          // Waiting behind, rising and scaling up into place
          const behind = i - active;
          const delta = behind - segP;
          const y = -50 + delta * 5;
          const scale = 1 - delta * 0.075;
          transformStr = `translate(-50%, ${y.toFixed(2)}%) scale(${scale.toFixed(4)}) rotateX(0deg)`;
          opacity = 1;
        }

        el.style.transform = transformStr;
        el.style.opacity = opacity;
      }

      // Update chrome indicators directly to avoid per-frame React state re-renders
      if (chromeProgressRef.current) {
        chromeProgressRef.current.textContent = `${Math.round(p * 100)}%`;
      }
      if (chromeCardRef.current) {
        const cardDisplay = Math.min(Math.floor(p * 3) + 1, 4);
        chromeCardRef.current.textContent = `0${cardDisplay} / 04`;
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${Math.round(p * 100)}%`;
      }
    };

    const tick = (now) => {
      let p = 0;

      if (prefersReducedMotion) {
        applyTransforms(0);
        return;
      }

      if (isAutoPlayingRef.current) {
        // Auto-plays on a ~7s loop (6s deal + 1s hold)
        if (!autoPlayStartRef.current) autoPlayStartRef.current = now;
        const elapsed = (now - autoPlayStartRef.current) % 7000;
        if (elapsed <= 6000) {
          p = elapsed / 6000;
        } else {
          p = 1;
        }
      } else if (wrapperRef.current) {
        // Timeline driven by single normalised progress p = clamp(-wrapper.top / (wrapper.height - innerHeight), 0, 1)
        const rect = wrapperRef.current.getBoundingClientRect();
        const maxScroll = rect.height - window.innerHeight;
        p = maxScroll > 0 ? Math.min(Math.max(-rect.top / maxScroll, 0), 1) : 0;
      }

      if (Math.abs(p - lastP) > 0.0001) {
        applyTransforms(p);
        lastP = p;
        const currentActive = Math.min(Math.floor(p * 4), 3);
        if (currentActive !== activeCardIndex) {
          setActiveCardIndex(currentActive);
        }
      }

      rAFId = requestAnimationFrame(tick);
    };

    rAFId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rAFId);
    };
  }, [activeCardIndex]);

  // Marker items for Card 0 (original SignalSection data)
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
    <section className="kexsio-stack-container relative w-full font-sans">
      {/* Injected style block containing all required styles, fonts and overrides */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        .kexsio-stack-container {
          background-color: #ece7dd;
          color: #1a1613;
        }

        .kexsio-mono {
          font-family: 'DM Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .kexsio-display {
          font-family: 'Big Shoulders Display', 'Arial Black', sans-serif !important;
          text-transform: uppercase;
          line-height: 0.92;
          letter-spacing: -0.02em;
        }

        .kexsio-body-copy {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        }

        .kexsio-chrome-elem {
          mix-blend-mode: difference;
          color: #ffffff;
          font-family: 'DM Mono', monospace !important;
          z-index: 60;
        }

        .kexsio-card {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: center bottom;
          will-change: transform, opacity;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          width: min(1140px, calc(100vw - 36px));
          height: min(620px, calc(100svh - 110px));
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.42), 0 10px 24px -5px rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.14);
        }

        @media (max-width: 1024px) {
          .kexsio-card {
            width: min(94vw, 680px);
            height: min(720px, calc(100svh - 90px));
          }
          .kexsio-card-inner {
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .kexsio-copy-col {
            padding: 24px 22px 18px 22px !important;
            max-width: 100% !important;
          }
          .kexsio-visual-col {
            padding: 0 16px 20px 16px !important;
            min-height: 320px !important;
          }
        }

        @media (max-width: 640px) {
          .kexsio-card {
            width: calc(100vw - 20px);
            height: calc(100svh - 80px);
            border-radius: 18px;
          }
          .kexsio-copy-col {
            padding: 18px 16px 12px 16px !important;
          }
          .kexsio-display {
            font-size: 2.1rem !important;
          }
          .kexsio-stats-grid {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px !important;
            margin-top: 14px !important;
            padding-top: 12px !important;
          }
        }

        .kexsio-bg-cover {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        /* Subtle scroll hint pulse */
        @keyframes kexsio-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        .kexsio-animate-bounce {
          animation: kexsio-bounce 2s infinite ease-in-out;
        }
      `}</style>



      {/* Pinned wrapper: 240svh provides crisp, responsive card deals without dead space */}
      <div 
        ref={wrapperRef} 
        style={{ height: isCardRoute ? '100svh' : '240svh' }} 
        className="relative w-full"
      >
        {/* Sticky stage: 100svh pinned in place while scrolling through the 900svh wrapper */}
        <div 
          ref={stageRef}
          className="sticky top-0 w-full h-[100svh] overflow-hidden bg-[#ece7dd] flex items-center justify-center select-none"
          style={{ perspective: '1200px' }}
        >
          {/* Mix-blend-difference fixed chrome */}
          <div className="kexsio-chrome-elem pointer-events-none absolute top-6 left-6 sm:top-8 sm:left-8 text-xs sm:text-sm font-bold tracking-wider">
            Kexsio® · SmartCity
          </div>

          <div className="kexsio-chrome-elem pointer-events-none absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center gap-4 text-xs sm:text-sm font-bold">
            <span ref={chromeCardRef}>01 / 04</span>
            <span className="hidden sm:inline-block opacity-40">|</span>
            <span className="hidden sm:inline-block">Stack · Scroll</span>
            <span ref={chromeProgressRef} className="px-2 py-0.5 rounded bg-white/20 text-[10px]">
              0%
            </span>
          </div>

          {/* Thin progress line along stage top */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-black/10 z-50 pointer-events-none">
            <div 
              ref={progressBarRef}
              className="h-full bg-[#c75a35] transition-all duration-75" 
              style={{ width: '0%' }}
            />
          </div>

          {/* Chrome bottom controls */}
          <div className="kexsio-chrome-elem absolute bottom-5 left-6 sm:bottom-7 sm:left-8 flex items-center gap-3 text-[11px] font-medium pointer-events-auto">
            <span className="opacity-70">Editorial Architecture · Pinned rAF Stack</span>
          </div>

          <div className="kexsio-chrome-elem absolute bottom-5 right-6 sm:bottom-7 sm:right-8 flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              className="px-3 py-1 rounded border border-white/40 text-[11px] font-bold tracking-wider hover:bg-white hover:text-black transition-colors"
            >
              {isAutoPlaying || isCardRoute ? 'PAUSE AUTO-DECK' : 'PLAY DECK (7S)'}
            </button>
          </div>

          {/* ==================== CARD 0: Brand Systems / Identity (Terracotta #c75a35) ==================== */}
          {/* EXACT SIGNAL SECTION CONTENT & INTERACTIVE VISUAL */}
          <div
            ref={(el) => (cardRefs.current[0] = el)}
            className="kexsio-card bg-[#c75a35] text-white"
            style={{ zIndex: 40 }}
          >
            <div className="kexsio-card-inner w-full h-full flex flex-row">
              {/* Column 1: Copy Column */}
              <div className="kexsio-copy-col flex flex-col justify-between w-full lg:w-[46%] p-8 sm:p-10 z-10 shrink-0">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                    </span>
                    <span className="kexsio-mono text-[11px] font-semibold text-white">
                      01 / LIVE INTELLIGENCE
                    </span>
                  </div>

                  <h3 className="kexsio-display text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-white mt-1">
                    Your City Has a Signal.
                  </h3>

                  <p className="kexsio-body-copy mt-4 text-sm sm:text-base text-white/85 leading-relaxed font-light">
                    We turn scattered civic complaints into a unified, real-time map of urban intelligence. Pinpoint priority issues before they escalate, coordinate departments, and save valuable time.
                  </p>
                </div>

                {/* Exact Stats Grid from SignalSection */}
                <div className="kexsio-stats-grid grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/20">
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      1,204
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 mt-1">
                      Issues Detected
                    </span>
                    <span className="text-[10px] font-medium text-white/90 mt-0.5">
                      ↑ 12%
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      4.2h
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 mt-1">
                      Avg Resolution
                    </span>
                    <span className="text-[10px] font-medium text-white/90 mt-0.5">
                      ↓ 8%
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      45
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 mt-1">
                      Active Signals
                    </span>
                    <span className="text-[10px] font-medium text-white/90 mt-0.5">
                      Steady
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: Visual Column (Cover Background Div + Exact Signal Dashboard) */}
              <div className="kexsio-visual-col flex-1 p-5 sm:p-6 flex items-center justify-center relative overflow-hidden bg-black/20">
                {/* Background cover image div (empty fallback if missing) */}
                <div 
                  className="kexsio-bg-cover absolute inset-0 opacity-15"
                  style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.2) 1px, transparent 1px)' }}
                />

                {/* Dashboard Card Container */}
                <div className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-slate-950/85 backdrop-blur-md p-1.5 shadow-2xl z-10">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 rounded-t-xl bg-slate-900/90 px-3.5 py-2.5 border-b border-slate-800">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-[#FF5F57]" />
                      <div className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
                      <div className="h-2 w-2 rounded-full bg-[#28C840]" />
                    </div>
                    <div className="ml-3 flex items-center gap-2 rounded-md bg-slate-950/80 border border-slate-800 px-2.5 py-0.5 flex-1 max-w-xs">
                      <div className="h-2 w-2 rounded-full bg-slate-600" />
                      <span className="text-[9px] text-slate-400 font-medium">smartcity.dashboard/analytics</span>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-slate-950 to-[#0c121e] rounded-b-xl">
                    {/* Top stats */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {[
                        { label: 'Active', value: '247', dot: 'bg-blue-500', trend: '↑ 12%', trendColor: 'text-blue-400' },
                        { label: 'Resolved', value: '38', dot: 'bg-teal-500', trend: '↑ 8%', trendColor: 'text-teal-400' },
                        { label: 'Response', value: '2.4h', dot: 'bg-amber-500', trend: '↓ 15%', trendColor: 'text-emerald-400' },
                        { label: 'Satisfact.', value: '94%', dot: 'bg-emerald-500', trend: '↑ 3%', trendColor: 'text-emerald-400' },
                      ].map((stat) => (
                        <div key={stat.label} className="rounded-lg bg-slate-900/80 p-2 border border-slate-800/80">
                          <div className="flex items-center gap-1 mb-1">
                            <div className={`h-1.5 w-1.5 rounded-full ${stat.dot}`} />
                            <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium truncate">{stat.label}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs sm:text-sm font-bold text-slate-200">{stat.value}</span>
                            <span className={`text-[8px] font-semibold ${stat.trendColor}`}>{stat.trend}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* SVG Map Area */}
                    <div className="relative mb-3 rounded-xl bg-slate-900/90 border border-slate-800 h-32 sm:h-36 overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:16px_16px]" />
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(148,163,184,0.2)" strokeWidth="2" />
                        <line x1="30%" y1="0" x2="30%" y2="100%" stroke="rgba(148,163,184,0.2)" strokeWidth="2" />
                        <line x1="68%" y1="0" x2="68%" y2="100%" stroke="rgba(148,163,184,0.2)" strokeWidth="2" />
                        <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="rgba(148,163,184,0.12)" strokeWidth="1" />
                        <line x1="10%" y1="75%" x2="90%" y2="75%" stroke="rgba(148,163,184,0.12)" strokeWidth="1" />
                      </svg>

                      {/* Animated Markers */}
                      <div className="absolute top-5 left-[20%] h-2.5 w-2.5 rounded-full bg-red-400 ring-4 ring-red-400/30 animate-pulse" />
                      <div className="absolute top-[38%] left-[42%] h-2.5 w-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/30" />
                      <div className="absolute bottom-[28%] left-[28%] h-2.5 w-2.5 rounded-full bg-blue-400 ring-4 ring-blue-400/30 animate-pulse" />
                      <div className="absolute top-[25%] right-[22%] h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-400/30" />

                      <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md bg-slate-950/90 px-2 py-1 text-[9px] font-bold text-slate-300 border border-slate-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live Signal Mesh
                      </div>
                    </div>

                    {/* Bottom charts */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800">
                        <div className="text-[9px] font-bold text-slate-400 mb-1.5">Weekly Volume</div>
                        <div className="flex items-end gap-1 h-9">
                          {[45, 60, 80, 40, 70, 95, 65].map((val, i) => (
                            <div 
                              key={i} 
                              className="flex-1 rounded-sm bg-gradient-to-t from-blue-600 to-blue-400" 
                              style={{ height: `${val}%` }} 
                            />
                          ))}
                        </div>
                      </div>

                      <div className="rounded-lg bg-slate-900/80 p-2 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] font-bold text-slate-400">Resolution</div>
                          <div className="text-base font-extrabold text-white mt-0.5">94%</div>
                          <div className="text-[8px] text-emerald-400 font-semibold">↑ On Target</div>
                        </div>
                        <div className="relative h-10 w-10 shrink-0">
                          <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="13" fill="none" stroke="#334155" strokeWidth="3" />
                            <circle 
                              cx="18" 
                              cy="18" 
                              r="13" 
                              fill="none" 
                              stroke="#3b82f6" 
                              strokeWidth="3" 
                              strokeDasharray="76.8 81.7" 
                              strokeLinecap="round" 
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">94</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating pill badge */}
                <div className="absolute -left-2 top-[32%] hidden sm:flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-700 p-2.5 shadow-xl z-20">
                  <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400">AI Priority</div>
                    <div className="text-[11px] font-bold text-white">Pothole — High</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== CARD 1: Motion Design / Kinetic (Deep Teal #1f4d4a) ==================== */}
          {/* AI AUTOMATED TRIAGE & NEURAL DISPATCH */}
          <div
            ref={(el) => (cardRefs.current[1] = el)}
            className="kexsio-card bg-[#1f4d4a] text-white"
            style={{ zIndex: 30 }}
          >
            <div className="kexsio-card-inner w-full h-full flex flex-row">
              {/* Copy column */}
              <div className="kexsio-copy-col flex flex-col justify-between w-full lg:w-[46%] p-8 sm:p-10 z-10 shrink-0">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 mb-4">
                    <Cpu className="w-3 h-3 text-teal-300" />
                    <span className="kexsio-mono text-[11px] font-semibold text-white">
                      02 / MOTION DESIGN · KINETIC
                    </span>
                  </div>

                  <h3 className="kexsio-display text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-white mt-1">
                    Kinetic Triage.
                  </h3>

                  <p className="kexsio-body-copy mt-4 text-sm sm:text-base text-white/85 leading-relaxed font-light">
                    Computer vision pipelines scan incoming photo submissions in real time. Potholes, damaged streetlights, and sanitation hazards are classified in under two seconds and routed with surgical precision.
                  </p>
                </div>

                <div className="kexsio-stats-grid grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/20">
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      99.2%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 mt-1">
                      Neural Vision
                    </span>
                    <span className="text-[10px] font-medium text-teal-200 mt-0.5">
                      Auto-Classified
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      &lt;1.8s
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 mt-1">
                      Triage Speed
                    </span>
                    <span className="text-[10px] font-medium text-teal-200 mt-0.5">
                      Zero Backlog
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      8 Depts
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 mt-1">
                      Synced Matrix
                    </span>
                    <span className="text-[10px] font-medium text-teal-200 mt-0.5">
                      Auto-Routed
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual column */}
              <div className="kexsio-visual-col flex-1 p-5 sm:p-6 flex items-center justify-center relative overflow-hidden bg-black/25">
                <div 
                  className="kexsio-bg-cover absolute inset-0 opacity-15"
                  style={{ backgroundImage: 'linear-gradient(45deg, #123331 25%, transparent 25%), linear-gradient(-45deg, #123331 25%, transparent 25%)' }}
                />

                <div className="relative w-full max-w-lg rounded-2xl border border-teal-400/20 bg-slate-950/90 backdrop-blur-md p-1.5 shadow-2xl z-10">
                  {/* Chrome */}
                  <div className="flex items-center justify-between rounded-t-xl bg-slate-900 px-3.5 py-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-teal-500" />
                        <div className="h-2 w-2 rounded-full bg-teal-400/60" />
                        <div className="h-2 w-2 rounded-full bg-teal-300/40" />
                      </div>
                      <span className="text-[9px] text-teal-400 font-mono ml-2">smartcity.ai/neural-triage</span>
                    </div>
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                      LIVE INFERENCE
                    </span>
                  </div>

                  {/* Visual Scanner content */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-slate-950 to-[#081816] rounded-b-xl">
                    <div className="relative rounded-xl border border-teal-500/30 bg-black/60 h-44 sm:h-48 overflow-hidden p-3 flex flex-col justify-between">
                      {/* Grid scanning lines */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.06)_1px,transparent_1px)] bg-[size:18px_18px]" />
                      
                      {/* Scanning laser line */}
                      <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent top-1/2 animate-pulse" />

                      {/* Detected Bounding Box */}
                      <div className="relative z-10 w-44 rounded border-2 border-teal-400/80 bg-teal-500/10 p-2 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-teal-300 uppercase">Target Detected</span>
                          <span className="text-[8px] font-bold text-white bg-teal-600 px-1 rounded">99.4%</span>
                        </div>
                        <div className="text-[11px] font-extrabold text-white mt-1">Hazard: Road Cavity</div>
                        <div className="text-[8px] text-teal-200 mt-0.5">Depth: 7.8cm · Severity: Critical</div>
                      </div>

                      {/* Pipeline steps */}
                      <div className="relative z-10 grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800">
                        <div className="bg-slate-900/90 rounded p-1.5 border border-slate-800">
                          <div className="text-[8px] text-slate-400">Classify</div>
                          <div className="text-[10px] font-bold text-teal-300">Asphalt</div>
                        </div>
                        <div className="bg-slate-900/90 rounded p-1.5 border border-slate-800">
                          <div className="text-[8px] text-slate-400">Dept</div>
                          <div className="text-[10px] font-bold text-teal-300">Public Works</div>
                        </div>
                        <div className="bg-slate-900/90 rounded p-1.5 border border-slate-800">
                          <div className="text-[8px] text-slate-400">Dispatch</div>
                          <div className="text-[10px] font-bold text-emerald-400">Crew #12</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -right-2 bottom-[24%] hidden sm:flex items-center gap-2 rounded-xl bg-slate-900/90 border border-teal-700/60 p-2.5 shadow-xl z-20">
                  <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400">Routing Latency</div>
                    <div className="text-[11px] font-bold text-teal-300">1.2s Dispatch</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== CARD 2: Spatial Work / Immersive (Indigo #2d2a66) ==================== */}
          {/* COORDINATED FIELD OPERATIONS & WORKFORCE */}
          <div
            ref={(el) => (cardRefs.current[2] = el)}
            className="kexsio-card bg-[#2d2a66] text-white"
            style={{ zIndex: 20 }}
          >
            <div className="kexsio-card-inner w-full h-full flex flex-row">
              {/* Copy column */}
              <div className="kexsio-copy-col flex flex-col justify-between w-full lg:w-[46%] p-8 sm:p-10 z-10 shrink-0">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 mb-4">
                    <Radio className="w-3 h-3 text-indigo-300" />
                    <span className="kexsio-mono text-[11px] font-semibold text-white">
                      03 / SPATIAL WORK · IMMERSIVE
                    </span>
                  </div>

                  <h3 className="kexsio-display text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-white mt-1">
                    Spatial Operations.
                  </h3>

                  <p className="kexsio-body-copy mt-4 text-sm sm:text-base text-white/85 leading-relaxed font-light">
                    Municipal workforces equipped with real-time geospatial routing and automated proof verification. From pothole restoration to electrical grid repairs, teams record GPS-verified before-and-after work evidence.
                  </p>
                </div>

                <div className="kexsio-stats-grid grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/20">
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      142
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 mt-1">
                      Active Crews
                    </span>
                    <span className="text-[10px] font-medium text-indigo-200 mt-0.5">
                      GPS Monitored
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      93.8%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 mt-1">
                      First-Visit Fix
                    </span>
                    <span className="text-[10px] font-medium text-indigo-200 mt-0.5">
                      High Efficiency
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      28m
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 mt-1">
                      Avg On-Site
                    </span>
                    <span className="text-[10px] font-medium text-indigo-200 mt-0.5">
                      ↓ 34% Response
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual column */}
              <div className="kexsio-visual-col flex-1 p-5 sm:p-6 flex items-center justify-center relative overflow-hidden bg-black/30">
                <div 
                  className="kexsio-bg-cover absolute inset-0 opacity-15"
                  style={{ backgroundImage: 'radial-gradient(#818cf8 1px, transparent 1px)' }}
                />

                <div className="relative w-full max-w-lg rounded-2xl border border-indigo-400/20 bg-slate-950/90 backdrop-blur-md p-1.5 shadow-2xl z-10">
                  <div className="flex items-center justify-between rounded-t-xl bg-slate-900 px-3.5 py-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                        <div className="h-2 w-2 rounded-full bg-indigo-400/60" />
                        <div className="h-2 w-2 rounded-full bg-indigo-300/40" />
                      </div>
                      <span className="text-[9px] text-indigo-400 font-mono ml-2">smartcity.field/spatial-ops</span>
                    </div>
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      GEOFENCE ACTIVE
                    </span>
                  </div>

                  <div className="p-3 sm:p-4 bg-gradient-to-br from-slate-950 to-[#100f28] rounded-b-xl">
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <div className="rounded-lg bg-slate-900/90 p-2.5 border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-400">Work Order</span>
                          <span className="text-[8px] font-bold text-amber-400">IN PROGRESS</span>
                        </div>
                        <div className="text-xs font-bold text-white mt-1">#WO-8821 Main St.</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Asphalt Resurfacing</div>
                      </div>

                      <div className="rounded-lg bg-slate-900/90 p-2.5 border border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-slate-400">Assigned Unit</span>
                          <span className="text-[8px] font-bold text-emerald-400">ON-SITE</span>
                        </div>
                        <div className="text-xs font-bold text-white mt-1">Crew 04 · Rapid Unit</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">GPS Match: 100%</div>
                      </div>
                    </div>

                    {/* Proof comparison widget */}
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-300">Proof Verification Engine</span>
                        <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Auto-Verified
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-black/50 border border-slate-800 p-2 text-center">
                          <div className="text-[8px] text-slate-400 uppercase font-mono">Before Inspection</div>
                          <div className="h-16 my-1 rounded bg-slate-800/80 flex items-center justify-center text-[9px] text-slate-400 border border-dashed border-slate-700">
                            Pothole Photo Tagged
                          </div>
                          <div className="text-[8px] text-red-400">09:14 AM · GPS #442</div>
                        </div>

                        <div className="rounded-lg bg-black/50 border border-slate-800 p-2 text-center">
                          <div className="text-[8px] text-slate-400 uppercase font-mono">After Completion</div>
                          <div className="h-16 my-1 rounded bg-emerald-950/40 flex items-center justify-center text-[9px] text-emerald-300 border border-emerald-800/60">
                            Resurfaced & Sealed
                          </div>
                          <div className="text-[8px] text-emerald-400">09:48 AM · Closed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-2 top-[30%] hidden sm:flex items-center gap-2 rounded-xl bg-slate-900/90 border border-indigo-700/60 p-2.5 shadow-xl z-20">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400">Proof Inspection</div>
                    <div className="text-[11px] font-bold text-indigo-300">Verified by Admin</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== CARD 3: The Studio / Kexsio (Charcoal #1a1613) ==================== */}
          {/* PREDICTIVE URBAN RESILIENCE & CIVIC GOVERNANCE */}
          <div
            ref={(el) => (cardRefs.current[3] = el)}
            className="kexsio-card bg-[#1a1613] text-white"
            style={{ zIndex: 10 }}
          >
            <div className="kexsio-card-inner w-full h-full flex flex-row">
              {/* Copy column */}
              <div className="kexsio-copy-col flex flex-col justify-between w-full lg:w-[46%] p-8 sm:p-10 z-10 shrink-0">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 mb-4">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span className="kexsio-mono text-[11px] font-semibold text-white">
                      04 / THE STUDIO · KEXSIO
                    </span>
                  </div>

                  <h3 className="kexsio-display text-4xl sm:text-5xl lg:text-[3.5rem] font-black tracking-tight text-white mt-1">
                    Urban Resilience.
                  </h3>

                  <p className="kexsio-body-copy mt-4 text-sm sm:text-base text-white/85 leading-relaxed font-light">
                    Transform historical incident trends into predictive infrastructure maintenance. Anticipate water main ruptures, traffic bottlenecks, and seasonal degradation before citizens notice.
                  </p>
                </div>

                <div className="kexsio-stats-grid grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/20">
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      4.6x
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 mt-1">
                      Preventive ROI
                    </span>
                    <span className="text-[10px] font-medium text-amber-200 mt-0.5">
                      Cost Avoidance
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      1.4M
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 mt-1">
                      Citizens Reached
                    </span>
                    <span className="text-[10px] font-medium text-amber-200 mt-0.5">
                      High Trust
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      99.9%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/70 mt-1">
                      City Uptime
                    </span>
                    <span className="text-[10px] font-medium text-amber-200 mt-0.5">
                      Municipal SLA
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual column */}
              <div className="kexsio-visual-col flex-1 p-5 sm:p-6 flex items-center justify-center relative overflow-hidden bg-black/40">
                <div 
                  className="kexsio-bg-cover absolute inset-0 opacity-15"
                  style={{ backgroundImage: 'radial-gradient(#f59e0b 1px, transparent 1px)' }}
                />

                <div className="relative w-full max-w-lg rounded-2xl border border-amber-400/20 bg-slate-950/90 backdrop-blur-md p-1.5 shadow-2xl z-10">
                  <div className="flex items-center justify-between rounded-t-xl bg-slate-900 px-3.5 py-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <div className="h-2 w-2 rounded-full bg-amber-400/60" />
                        <div className="h-2 w-2 rounded-full bg-amber-300/40" />
                      </div>
                      <span className="text-[9px] text-amber-400 font-mono ml-2">smartcity.command/predictive</span>
                    </div>
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      CITY HEALTH: 98.6
                    </span>
                  </div>

                  <div className="p-3 sm:p-4 bg-gradient-to-br from-slate-950 to-[#1f1911] rounded-b-xl">
                    {/* Predictive curve */}
                    <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-300">Predictive Incident Curve</span>
                        <span className="text-[8px] text-amber-400 font-mono">14-DAY FORECAST</span>
                      </div>

                      <div className="h-24 w-full relative">
                        <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path 
                            d="M 0,60 Q 50,15 100,45 T 200,30 T 300,10 L 300,80 L 0,80 Z" 
                            fill="url(#curveGrad)" 
                          />
                          <path 
                            d="M 0,60 Q 50,15 100,45 T 200,30 T 300,10" 
                            fill="none" 
                            stroke="#f59e0b" 
                            strokeWidth="2.5" 
                          />
                          {/* Key alert nodes */}
                          <circle cx="100" cy="45" r="3.5" fill="#f59e0b" />
                          <circle cx="200" cy="30" r="3.5" fill="#fbbf24" />
                          <circle cx="300" cy="10" r="3.5" fill="#34d399" />
                        </svg>
                      </div>

                      <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1">
                        <span>TODAY</span>
                        <span>DAY 04</span>
                        <span>DAY 08</span>
                        <span>DAY 14 (SAFE)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
                        <div className="text-[8px] text-slate-400">Estimated Savings</div>
                        <div className="text-sm font-extrabold text-amber-300 mt-0.5">$1,240,000</div>
                        <div className="text-[8px] text-emerald-400">Budget Optimized</div>
                      </div>

                      <div className="rounded-lg bg-slate-900/90 p-2 border border-slate-800">
                        <div className="text-[8px] text-slate-400">Prevented Failures</div>
                        <div className="text-sm font-extrabold text-amber-300 mt-0.5">382 Incidents</div>
                        <div className="text-[8px] text-emerald-400">Pre-Empted</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-2 bottom-[26%] hidden sm:flex items-center gap-2 rounded-xl bg-slate-900/90 border border-amber-700/60 p-2.5 shadow-xl z-20">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                    <BarChart3 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400">Resilience Index</div>
                    <div className="text-[11px] font-bold text-amber-300">Tier-1 Superior</div>
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
