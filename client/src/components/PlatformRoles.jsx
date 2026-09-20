import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const baseRoles = [
  {
    id: "citizen",
    r: "Citizen App",
    subtitle: "Public Engagement & Reporting",
    tagline: "Empowering everyday citizens",
    badge: "Citizen Portal",
    img: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80",
    d: "Report issues in 3 clicks. Track progress transparently with real-time updates and interactive neighborhood maps.",
    features: [
      "One-tap photo & GPS location pin",
      "Live status timeline & notifications",
      "Community upvoting & feedback"
    ],
    cta: "Launch Citizen Portal",
    href: "/login"
  },
  {
    id: "admin",
    r: "Admin Command Portal",
    subtitle: "Unified Municipal Governance",
    tagline: "Citywide coordination & intelligence",
    badge: "Command Center",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    d: "Oversee the entire city. Make data-driven operational decisions from a powerful command center with GIS heatmaps.",
    features: [
      "Real-time GIS heatmap & SLA timers",
      "Automated AI severity scoring & triage",
      "Instant field crew dispatch & analytics"
    ],
    cta: "Launch Command Center",
    href: "/login"
  },
  {
    id: "worker",
    r: "Field Worker App",
    subtitle: "On-Site Diagnostics & Resolution",
    tagline: "Rapid field crew execution",
    badge: "Operations Crew",
    img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80",
    d: "Receive optimized routes, clear task instructions, and simple one-tap completion logs on the go.",
    features: [
      "Turn-by-turn route navigation",
      "Before & after photo verification",
      "Offline sync & rapid checklist"
    ],
    cta: "Launch Field App",
    href: "/login"
  }
];

// Tripled array for infinite seamless looping
const extendedRoles = [...baseRoles, ...baseRoles, ...baseRoles];

export default function PlatformRoles() {
  const [index, setIndex] = useState(3); // Start at index 3 (first item of second set)
  const [enableTransition, setEnableTransition] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const touchStartX = useRef(null);

  const [dimensions, setDimensions] = useState(() => {
    if (typeof window === 'undefined') return { cardWidth: 380, gap: 32, isSmall: false };
    const isSmall = window.innerWidth < 768;
    return {
      cardWidth: isSmall ? Math.min(window.innerWidth - 48, 340) : 380,
      gap: isSmall ? 16 : 32,
      isSmall
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 768;
      setDimensions({
        cardWidth: isSmall ? Math.min(window.innerWidth - 48, 340) : 380,
        gap: isSmall ? 16 : 32,
        isSmall
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Infinite seamless loop transition handler
  const handleTransitionEnd = () => {
    if (index >= 6) {
      setEnableTransition(false);
      setIndex(index - 3);
    } else if (index < 3) {
      setEnableTransition(false);
      setIndex(index + 3);
    }
  };

  useEffect(() => {
    if (!enableTransition) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableTransition(true);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [enableTransition]);

  const slidePrev = () => {
    setIsFlipped(false);
    setIndex((prev) => prev - 1);
  };

  const slideNext = () => {
    setIsFlipped(false);
    setIndex((prev) => prev + 1);
  };

  const selectRoleIndex = (roleIdx) => {
    setIsFlipped(false);
    const currentRole = index % 3;
    let diff = roleIdx - currentRole;
    if (diff > 1) diff -= 3;
    if (diff < -1) diff += 3;
    setIndex(index + diff);
  };

  // Touch Swipe support for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) {
      slideNext();
    } else if (diff < -50) {
      slidePrev();
    }
    touchStartX.current = null;
  };

  const activeRole = baseRoles[index % 3];

  return (
    <section id="built-for-everyone" className="platform-roles-section bg-brand-50 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="py-24 border-t border-brand-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/80 border border-brand-200 text-brand-700 text-[11px] font-extrabold uppercase tracking-widest mb-3">
              Tailored Personas
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-sky-500">Everyone.</span>
            </h2>
            <p className="text-slate-500 mt-4 text-base sm:text-lg font-light leading-relaxed">
              Three beautifully tailored experiences perfectly synchronized in real-time. No training required.
            </p>
          </div>
        </div>

        {/* Real Physical Horizontal Sliding Carousel Track */}
        <div
          className="relative w-full overflow-hidden py-6"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex items-center"
            style={{
              transform: `translateX(calc(50% - ${dimensions.cardWidth / 2}px - ${index * (dimensions.cardWidth + dimensions.gap)}px))`,
              transition: enableTransition ? 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
              gap: `${dimensions.gap}px`,
              willChange: 'transform'
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedRoles.map((role, i) => {
              const isActive = (i === index);

              return (
                <div
                  key={`${role.id}-${i}`}
                  style={{ width: `${dimensions.cardWidth}px` }}
                  className={`shrink-0 transition-all duration-500 ease-out select-none ${
                    isActive
                      ? 'scale-100 opacity-100 z-30'
                      : 'scale-[0.88] opacity-55 hover:opacity-85 z-10 cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!isActive) {
                      setIndex(i);
                      setIsFlipped(false);
                    }
                  }}
                >
                  {isActive ? (
                    /* Active Card: Retains Full 3D Flip Animation */
                    <div className="w-full h-[490px] perspective-[1200px] group">
                      <div
                        className={`relative w-full h-full transform-3d transition-transform duration-700 ${
                          isFlipped ? "transform-[rotateY(180deg)]" : ""
                        } group-hover:transform-[rotateY(180deg)]`}
                      >
                        {/* Front Face of Active Card */}
                        <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border-2 border-brand-300 bg-white p-5 shadow-2xl backface-hidden">
                          <div>
                            <div className="relative h-56 w-full rounded-xl overflow-hidden shadow-inner mb-4 bg-slate-100">
                              <img
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                src={role.img}
                                alt={role.r}
                              />
                              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-brand-700 shadow-sm border border-brand-100">
                                {role.badge}
                              </div>
                              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-medium text-white flex items-center gap-1.5 shadow-sm">
                                <span className="text-brand-300">↺</span> Hover or tap to flip
                              </div>
                            </div>

                            <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                              {role.tagline}
                            </span>
                            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                              {role.r}
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                              {role.d}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium">
                              Role 0{(index % 3) + 1} of 03
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsFlipped(true);
                              }}
                              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                            >
                              Capabilities & Actions →
                            </button>
                          </div>
                        </div>

                        {/* Back Face of Active Card (Flipped 180deg) */}
                        <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border-2 border-brand-500/40 bg-[#0A1121] p-6 text-white backface-hidden transform-[rotateY(180deg)] shadow-2xl">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-400 bg-brand-950/90 px-2.5 py-1 rounded-md border border-brand-500/30">
                                Built for everyone
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsFlipped(false);
                               }}
                                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded bg-slate-800/60"
                              >
                                ↺ Front
                              </button>
                            </div>

                            <h3 className="mt-4 text-2xl font-bold tracking-tight text-white">
                              {role.r}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-slate-300">
                              {role.d}
                            </p>

                            <div className="mt-5 space-y-2.5">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Core Capabilities</p>
                              {role.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                                  <div className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
                                    ✓
                                  </div>
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4">
                            <a
                              href={role.href}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] transition-all"
                            >
                              {role.cta}
                              <ArrowRight className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Side Preview Card (Smoothly scaled down, click to center) */
                    <div className="w-full h-[490px] rounded-2xl border border-slate-200/90 bg-white/85 backdrop-blur-sm p-4 shadow-md flex flex-col justify-between transition-all hover:shadow-xl hover:border-brand-200">
                      <div>
                        <div className="relative h-56 w-full rounded-xl overflow-hidden mb-4 bg-slate-100">
                          <img
                            src={role.img}
                            alt={role.r}
                            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                          <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10">
                            {role.badge}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                          {role.tagline}
                        </span>
                        <h3 className="text-xl font-bold text-slate-800 leading-snug mt-1">
                          {role.r}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                          {role.d}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-brand-600 font-semibold">
                        <span>Click to center</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Role Label Beneath Track */}
        <div className="text-center mt-3">
          <p className="text-base font-bold text-slate-950 tracking-tight">{activeRole.r}</p>
          <p className="text-xs font-medium text-slate-500">{activeRole.subtitle}</p>
        </div>

        {/* Navigation Controls: Chevrons & Pill Dots */}
        <div className="flex items-center justify-center gap-3.5 mt-6">
          <button
            type="button"
            onClick={slidePrev}
            aria-label="Previous role"
            className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition shadow-sm cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            {baseRoles.map((role, i) => (
              <button
                key={i}
                onClick={() => selectRoleIndex(i)}
                aria-label={`Select ${role.r}`}
                className={`cursor-pointer transition-all duration-300 ${
                  i === (index % 3)
                    ? 'w-7 h-2.5 rounded-full bg-brand-600 shadow-sm'
                    : 'w-2.5 h-2.5 rounded-full bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={slideNext}
            aria-label="Next role"
            className="p-2.5 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition shadow-sm cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
