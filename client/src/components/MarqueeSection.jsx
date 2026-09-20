import React from 'react';

const infrastructureData = [
  {
    category: "Mobility & Transit",
    title: "Smart Traffic Corridors",
    desc: "Real-time municipal road network flow & traffic intelligence",
    image: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?q=80&h=800&w=1200&auto=format&fit=crop",
  },
  {
    category: "Roads & Pavement",
    title: "Street & Highway Repair",
    desc: "Rapid response pothole patching & street surfacing crews",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb186f5f7?q=80&h=800&w=1200&auto=format&fit=crop",
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
  return (
    <section id="city-infrastructure" className="city-infrastructure-section relative z-10 py-20 bg-white border-t border-slate-100 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&display=swap');

        .city-infrastructure-section, .city-infrastructure-section * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

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
        <div className="flex items-center gap-2.5 h-[420px] w-full min-w-[750px] sm:min-w-0 max-w-5xl mx-auto">
          {infrastructureData.map((item, index) => (
            <div
              key={index}
              className="relative group flex-grow transition-all w-56 rounded-2xl overflow-hidden h-[420px] duration-500 hover:w-full cursor-pointer shadow-md hover:shadow-2xl border border-slate-100/80"
            >
              <img
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                src={item.image}
                alt={item.title}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex flex-col justify-end p-5 transition-all">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 opacity-90">
                  {item.category}
                </span>
                <h3 className="text-white text-base sm:text-lg font-bold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis mt-0.5">
                  {item.title}
                </h3>
                <p className="text-slate-300 text-xs mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block font-light">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
