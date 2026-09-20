import React, { useState, useRef } from 'react';

const infrastructureData = [
  {
    category: "Mobility & Transit",
    title: "Smart Traffic Corridors",
    desc: "Real-time municipal road network flow & traffic intelligence",
    image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&h=800&w=1200&auto=format&fit=crop",
  },
  {
    category: "Roads & Pavement",
    title: "Street & Highway Repair",
    desc: "Rapid response pothole patching & street surfacing crews",
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&h=800&w=1200&auto=format&fit=crop",
  },
  {
    category: "Water & Drainage",
    title: "Clean Water Networks",
    desc: "Reservoirs, aqueducts, and municipal drainage monitoring",
    image: "https://images.unsplash.com/photo-1574958269340-fa927503f3dd?q=80&h=800&w=1200&auto=format&fit=crop",
  },
  {
    category: "Energy & Power",
    title: "Intelligent Streetlight Grid",
    desc: "Automated outage alerts & energy-efficient LED corridors",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&h=800&w=1200&auto=format&fit=crop",
  },
  {
    category: "Sanitation & Green",
    title: "Waste & Recycling Logistics",
    desc: "Smart fill-level tracking & optimized collection routing",
    image: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&h=800&w=1200&auto=format&fit=crop",
  },
  {
    category: "Operations Center",
    title: "Unified Command Matrix",
    desc: "Centralized civic monitoring, dispatch & field telemetry",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&h=800&w=1200&auto=format&fit=crop",
  },
];

export default function MarqueeSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const cardRefs = useRef([]);

  const handleCardSelect = (index) => {
    setActiveIdx(index);
    if (cardRefs.current[index]) {
      cardRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  };

  return (
    <section id="city-infrastructure" className="city-infrastructure-section relative z-10 py-20 bg-white border-t border-slate-100 overflow-hidden">
      <div className="text-center mb-6 max-w-3xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-[11px] font-extrabold uppercase tracking-widest mb-3">
          City Infrastructure
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          Powering the Cities of Tomorrow
        </h2>
        <p className="text-sm text-slate-500 text-center mt-3 max-w-xl mx-auto leading-relaxed">
          An interactive visual showcase of our connected urban infrastructure — coordinating roads, clean water, electrical grids, sanitation, and real-time civic intelligence.
        </p>
      </div>

      <div className="overflow-x-auto pb-6 pt-4 px-4 sm:px-6">
        <div className="flex items-center gap-2.5 h-[420px] w-full min-w-[680px] sm:min-w-0 max-w-5xl mx-auto">
          {infrastructureData.map((item, index) => {
            const isActive = activeIdx === index;
            return (
              <div
                key={index}
                ref={(el) => (cardRefs.current[index] = el)}
                onClick={() => handleCardSelect(index)}
                onMouseEnter={() => setActiveIdx(index)}
                className={`relative group transition-all duration-500 rounded-2xl overflow-hidden h-[420px] cursor-pointer border border-slate-100/80 shrink-0 sm:shrink ${
                  isActive
                    ? 'w-[75vw] max-w-[340px] sm:max-w-none sm:w-full sm:flex-grow-[3.5] shadow-2xl ring-2 ring-brand-500/20'
                    : 'w-14 sm:w-40 lg:w-48 sm:flex-grow-[1] opacity-75 hover:opacity-100 shadow-md'
                }`}
              >
                <img
                  className={`h-full w-full object-cover object-center transition-transform duration-700 ${
                    isActive ? 'scale-105' : 'group-hover:scale-105 grayscale-[15%]'
                  }`}
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-4 sm:p-5 transition-all">
                  {/* Expanded Active View */}
                  {isActive ? (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 opacity-90">
                        {item.category}
                      </span>
                      <h3 className="text-white text-base sm:text-lg font-bold tracking-tight whitespace-normal sm:whitespace-nowrap overflow-hidden text-ellipsis mt-0.5">
                        {item.title}
                      </h3>
                      <p className="text-slate-300 text-xs mt-1 leading-relaxed font-light">
                        {item.desc}
                      </p>
                    </div>
                  ) : (
                    /* Collapsed Inactive View */
                    <>
                      <div className="hidden sm:block">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 opacity-80 truncate block">
                          {item.category}
                        </span>
                        <h3 className="text-white text-sm font-bold tracking-tight truncate mt-0.5">
                          {item.title}
                        </h3>
                      </div>
                      <div className="sm:hidden flex flex-col items-center justify-end h-full pb-1">
                        <span className="text-[11px] font-extrabold text-white/95 bg-slate-950/80 backdrop-blur-sm w-7 h-7 rounded-full flex items-center justify-center border border-white/20 shadow-sm">
                          0{index + 1}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Indicator Dots */}
      <div className="flex sm:hidden items-center justify-center gap-2 mt-2 pb-2">
        {infrastructureData.map((item, i) => (
          <button
            key={i}
            onClick={() => handleCardSelect(i)}
            aria-label={`View ${item.title}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIdx === i ? 'w-6 bg-brand-600' : 'w-1.5 bg-slate-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
