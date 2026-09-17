import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Cpu, 
  Radio, 
  Sparkles
} from 'lucide-react';

export default function SignalSection() {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);

  // Check if route loaded with ?card (gallery card mode without page scroll)
  const [isCardRoute] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.has('card') || window.location.hash.includes('card');
  });

  const autoPlayStartRef = useRef(0);

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
      const N = 4;
      const segment = 1 / N; // 0.25
      const active = Math.min(Math.floor(p / segment), N - 1);
      const segP = Math.max(0, Math.min(1, (p - active * segment) / segment));

      for (let i = 0; i < N; i++) {
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
    };

    const tick = (now) => {
      let p = 0;

      if (prefersReducedMotion) {
        applyTransforms(0);
        return;
      }

      if (isCardRoute) {
        // Auto-plays on a ~7s loop (6s deal + 1s hold) when ?card is present
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
      }

      rAFId = requestAnimationFrame(tick);
    };

    // Immediate initial layout at rest
    applyTransforms(0);

    const onScroll = () => {
      if (wrapperRef.current && !isCardRoute) {
        const rect = wrapperRef.current.getBoundingClientRect();
        const maxScroll = rect.height - window.innerHeight;
        const p = maxScroll > 0 ? Math.min(Math.max(-rect.top / maxScroll, 0), 1) : 0;
        if (Math.abs(p - lastP) > 0.0001) {
          applyTransforms(p);
          lastP = p;
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    rAFId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rAFId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isCardRoute]);

  return (
    <section className="smartcity-stack-container relative w-full bg-[#080B12]">
      {/* Injected style block containing scoped styling and typography overrides */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap');

        .smartcity-stack-container {
          background-color: #080B12;
          color: #ffffff;
        }

        .smartcity-card-kicker {
          font-family: 'DM Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        .smartcity-card-title {
          font-family: 'Big Shoulders Display', 'Arial Black', -apple-system, BlinkMacSystemFont, sans-serif !important;
          text-transform: uppercase;
          line-height: 0.94;
          letter-spacing: -0.02em;
        }

        .smartcity-card-body {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        }

        .smartcity-editorial-card {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-origin: center bottom;
          will-change: transform, opacity;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          width: min(1160px, calc(100vw - 36px));
          height: min(600px, calc(100svh - 120px));
          border-radius: 26px;
          overflow: hidden;
        }

        @media (max-width: 1024px) {
          .smartcity-editorial-card {
            width: min(94vw, 680px);
            height: min(680px, calc(100svh - 100px));
          }
          .smartcity-card-inner {
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .smartcity-copy-col {
            padding: 26px 24px 18px 24px !important;
            max-width: 100% !important;
          }
          .smartcity-visual-col {
            padding: 0 20px 24px 20px !important;
            min-height: 280px !important;
          }
        }

        @media (max-width: 640px) {
          .smartcity-editorial-card {
            width: calc(100vw - 20px);
            height: calc(100svh - 80px);
            border-radius: 20px;
          }
          .smartcity-copy-col {
            padding: 20px 18px 14px 18px !important;
          }
          .smartcity-card-title {
            font-size: 2.2rem !important;
          }
          .smartcity-stats-row {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px !important;
            margin-top: 14px !important;
            padding-top: 12px !important;
          }
        }

        .smartcity-img-cover {
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }
      `}</style>

      {/* Pinned wrapper: 360svh drives the 4-card sequence smoothly without dead space */}
      <div 
        ref={wrapperRef} 
        style={{ height: isCardRoute ? '100svh' : '360svh' }} 
        className="relative w-full"
      >
        {/* Sticky stage: 100svh pinned in place while scrolling */}
        <div 
          ref={stageRef}
          className="sticky top-0 w-full h-[100svh] overflow-hidden bg-[#080B12] flex items-center justify-center select-none"
          style={{ perspective: '1200px' }}
        >
          {/* Ambient Lighting & Background Grid matching SmartCity UI theme */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[5%] left-[5%] w-[550px] h-[550px] rounded-full bg-[#4F8CFF]/12 blur-[130px]" />
            <div className="absolute bottom-[5%] right-[5%] w-[650px] h-[650px] rounded-full bg-[#7C5CFC]/12 blur-[150px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
          </div>

          {/* ==================== CARD 0: Brand Systems / Live Intelligence (Deep Civic Sapphire) ==================== */}
          <div
            ref={(el) => (cardRefs.current[0] = el)}
            className="smartcity-editorial-card text-white border border-[#4F8CFF]/30 shadow-[0_30px_90px_-15px_rgba(0,0,0,0.85),0_0_50px_-10px_rgba(59,130,246,0.22)]"
            style={{ 
              zIndex: 40,
              background: 'linear-gradient(135deg, #091428 0%, #060B17 100%)' 
            }}
          >
            <div className="smartcity-card-inner w-full h-full flex flex-row">
              {/* Copy Column */}
              <div className="smartcity-copy-col flex flex-col justify-between w-full lg:w-[48%] p-8 sm:p-10 z-10 shrink-0">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4F8CFF] opacity-80" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4F8CFF]" />
                    </span>
                    <span className="smartcity-card-kicker text-[11px] font-semibold text-[#60A5FA]">
                      01 / LIVE INTELLIGENCE
                    </span>
                  </div>

                  <h3 className="smartcity-card-title text-4xl sm:text-5xl lg:text-[3.6rem] font-black tracking-tight text-white mt-1">
                    Your City Has a Signal.
                  </h3>

                  <p className="smartcity-card-body mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                    We turn scattered civic complaints into a unified, real-time map of urban intelligence. Pinpoint priority issues before they escalate, coordinate departments, and save valuable time.
                  </p>
                </div>

                {/* Exact Stats Grid from original SignalSection */}
                <div className="smartcity-stats-row grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      1,204
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      Issues Detected
                    </span>
                    <span className="text-[10px] font-semibold text-red-400 mt-0.5">
                      ↑ 12%
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      4.2h
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      Avg Resolution
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-400 mt-0.5">
                      ↓ 8%
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      45
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      Active Signals
                    </span>
                    <span className="text-[10px] font-semibold text-sky-400 mt-0.5">
                      Steady
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Column: 4K Real Image of Illuminated Smart City Aerial Grid */}
              <div className="smartcity-visual-col flex-1 p-5 sm:p-6 flex items-center justify-center relative overflow-hidden">
                <div 
                  className="smartcity-img-cover absolute inset-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2000&q=85')` 
                  }}
                >
                  {/* Subtle Tech Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#091428]/90 via-transparent to-[#091428]/40" />

                  {/* High-tech Glass HUD Overlays */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-white shadow-lg">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE SATELLITE MESH · 4K
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400">Telemetry Layer</div>
                      <div className="text-xs font-bold text-white mt-0.5">Metropolitan Arterial Node #402</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">99.8% Clarity</div>
                      <div className="text-[10px] text-slate-300">Geo-Tagged Live</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== CARD 1: Kinetic Triage (Deep Midnight Cyan / Emerald) ==================== */}
          <div
            ref={(el) => (cardRefs.current[1] = el)}
            className="smartcity-editorial-card text-white border border-teal-500/30 shadow-[0_30px_90px_-15px_rgba(0,0,0,0.85),0_0_50px_-10px_rgba(20,184,166,0.22)]"
            style={{ 
              zIndex: 30,
              background: 'linear-gradient(135deg, #061B1E 0%, #030E10 100%)' 
            }}
          >
            <div className="smartcity-card-inner w-full h-full flex flex-row">
              {/* Copy Column */}
              <div className="smartcity-copy-col flex flex-col justify-between w-full lg:w-[48%] p-8 sm:p-10 z-10 shrink-0">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 mb-4">
                    <Cpu className="w-3.5 h-3.5 text-teal-400" />
                    <span className="smartcity-card-kicker text-[11px] font-semibold text-teal-400">
                      02 / MOTION DESIGN · KINETIC
                    </span>
                  </div>

                  <h3 className="smartcity-card-title text-4xl sm:text-5xl lg:text-[3.6rem] font-black tracking-tight text-white mt-1">
                    Kinetic Triage.
                  </h3>

                  <p className="smartcity-card-body mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                    Computer vision pipelines scan incoming photo submissions in real time. Potholes, damaged streetlights, and sanitation hazards are classified in under two seconds and routed with surgical precision.
                  </p>
                </div>

                <div className="smartcity-stats-row grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      99.2%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      Neural Vision
                    </span>
                    <span className="text-[10px] font-semibold text-teal-400 mt-0.5">
                      Auto-Classified
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      &lt;1.8s
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      Triage Speed
                    </span>
                    <span className="text-[10px] font-semibold text-teal-400 mt-0.5">
                      Zero Backlog
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      8 Depts
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      Synced Matrix
                    </span>
                    <span className="text-[10px] font-semibold text-teal-400 mt-0.5">
                      Auto-Routed
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Column: 4K Real Image of Urban Motion Traffic & Light Trails */}
              <div className="smartcity-visual-col flex-1 p-5 sm:p-6 flex items-center justify-center relative overflow-hidden">
                <div 
                  className="smartcity-img-cover absolute inset-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=2000&q=85')` 
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061B1E]/90 via-transparent to-[#061B1E]/40" />

                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-white shadow-lg">
                    <Activity className="w-3 h-3 text-teal-400" />
                    KINETIC INFERENCE · 4K
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400">Autonomous Classifier</div>
                      <div className="text-xs font-bold text-teal-300 mt-0.5">Hazard Detection: Pothole & Obstruction</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono text-teal-400 font-semibold">&lt;1.4s Dispatch</div>
                      <div className="text-[10px] text-slate-300">Confidence 99.4%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== CARD 2: Spatial Operations (Deep Cosmic Indigo / Violet) ==================== */}
          <div
            ref={(el) => (cardRefs.current[2] = el)}
            className="smartcity-editorial-card text-white border border-[#7C5CFC]/30 shadow-[0_30px_90px_-15px_rgba(0,0,0,0.85),0_0_50px_-10px_rgba(124,92,252,0.22)]"
            style={{ 
              zIndex: 20,
              background: 'linear-gradient(135deg, #120D2C 0%, #080617 100%)' 
            }}
          >
            <div className="smartcity-card-inner w-full h-full flex flex-row">
              {/* Copy Column */}
              <div className="smartcity-copy-col flex flex-col justify-between w-full lg:w-[48%] p-8 sm:p-10 z-10 shrink-0">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C5CFC]/15 border border-[#7C5CFC]/30 mb-4">
                    <Radio className="w-3.5 h-3.5 text-[#A78BFA]" />
                    <span className="smartcity-card-kicker text-[11px] font-semibold text-[#A78BFA]">
                      03 / SPATIAL WORK · IMMERSIVE
                    </span>
                  </div>

                  <h3 className="smartcity-card-title text-4xl sm:text-5xl lg:text-[3.6rem] font-black tracking-tight text-white mt-1">
                    Spatial Operations.
                  </h3>

                  <p className="smartcity-card-body mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                    Municipal workforces equipped with real-time geospatial routing and automated proof verification. From pothole restoration to electrical grid repairs, teams record GPS-verified before-and-after work evidence.
                  </p>
                </div>

                <div className="smartcity-stats-row grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      142
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      Active Crews
                    </span>
                    <span className="text-[10px] font-semibold text-violet-400 mt-0.5">
                      GPS Monitored
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      93.8%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      First-Visit Fix
                    </span>
                    <span className="text-[10px] font-semibold text-violet-400 mt-0.5">
                      High Quality
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      28m
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      Avg On-Site
                    </span>
                    <span className="text-[10px] font-semibold text-violet-400 mt-0.5">
                      ↓ 34% Arrival
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Column: 4K Real Image of Urban Infrastructure & Bridges Grid */}
              <div className="smartcity-visual-col flex-1 p-5 sm:p-6 flex items-center justify-center relative overflow-hidden">
                <div 
                  className="smartcity-img-cover absolute inset-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=2000&q=85')` 
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120D2C]/90 via-transparent to-[#120D2C]/40" />

                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-white shadow-lg">
                    <span className="h-2 w-2 rounded-full bg-[#7C5CFC] animate-ping" />
                    GPS GEOFENCE ACTIVE · 4K
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400">Active Work Order</div>
                      <div className="text-xs font-bold text-violet-300 mt-0.5">#WO-8821 Main St. Infrastructure</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">Proof Verified</div>
                      <div className="text-[10px] text-slate-300">Crew 04 On-Site</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ==================== CARD 3: Predictive Urban Resilience (Deep Obsidian Cobalt) ==================== */}
          <div
            ref={(el) => (cardRefs.current[3] = el)}
            className="smartcity-editorial-card text-white border border-sky-500/30 shadow-[0_30px_90px_-15px_rgba(0,0,0,0.85),0_0_50px_-10px_rgba(56,189,248,0.22)]"
            style={{ 
              zIndex: 10,
              background: 'linear-gradient(135deg, #0A1326 0%, #050A14 100%)' 
            }}
          >
            <div className="smartcity-card-inner w-full h-full flex flex-row">
              {/* Copy Column */}
              <div className="smartcity-copy-col flex flex-col justify-between w-full lg:w-[48%] p-8 sm:p-10 z-10 shrink-0">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/30 mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span className="smartcity-card-kicker text-[11px] font-semibold text-sky-400">
                      04 / CIVIC GOVERNANCE · PREDICTIVE
                    </span>
                  </div>

                  <h3 className="smartcity-card-title text-4xl sm:text-5xl lg:text-[3.6rem] font-black tracking-tight text-white mt-1">
                    Urban Resilience.
                  </h3>

                  <p className="smartcity-card-body mt-4 text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                    Transform historical incident trends into predictive infrastructure maintenance. Anticipate water main ruptures, traffic bottlenecks, and seasonal degradation before citizens notice.
                  </p>
                </div>

                <div className="smartcity-stats-row grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-white/10">
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      4.6x
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      Preventive ROI
                    </span>
                    <span className="text-[10px] font-semibold text-sky-400 mt-0.5">
                      Cost Avoidance
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      1.4M
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      Citizens Served
                    </span>
                    <span className="text-[10px] font-semibold text-sky-400 mt-0.5">
                      High Trust
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      99.9%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                      City Uptime
                    </span>
                    <span className="text-[10px] font-semibold text-sky-400 mt-0.5">
                      Municipal SLA
                    </span>
                  </div>
                </div>
              </div>

              {/* Visual Column: 4K Real Image of Cloud Data Center / Command Telemetry */}
              <div className="smartcity-visual-col flex-1 p-5 sm:p-6 flex items-center justify-center relative overflow-hidden">
                <div 
                  className="smartcity-img-cover absolute inset-4 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                  style={{ 
                    backgroundImage: `url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=85')` 
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1326]/90 via-transparent to-[#0A1326]/40" />

                  <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/75 backdrop-blur-md border border-white/15 text-[10px] font-mono font-bold text-white shadow-lg">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    PREDICTIVE COMMAND · 4K
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white">
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-400">Municipal Health SLA</div>
                      <div className="text-xs font-bold text-sky-300 mt-0.5">98.6 City Resilience Score</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold">$1.2M Saved</div>
                      <div className="text-[10px] text-slate-300">Preventive Core Active</div>
                    </div>
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
