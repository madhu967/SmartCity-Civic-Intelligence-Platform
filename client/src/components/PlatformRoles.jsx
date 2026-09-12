import React from 'react';
import { Smartphone, MonitorDot, HardHat, ArrowRight } from 'lucide-react';

export default function PlatformRoles() {
  return (
    <section className="bg-brand-50 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl pointer-events-none"></div>
      {/* Built for Everyone */}
      <div className="py-24 border-t border-brand-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-sky-500">Everyone.</span>
            </h2>
            <p className="text-slate-500 mt-5 text-lg font-light leading-relaxed">
              Three beautifully tailored experiences perfectly synchronized in real-time. No training required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { 
                img: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=800&q=80",
                r: "Citizen App", 
                d: "Report issues in 3 clicks. Track progress transparently with real-time updates." 
              },
              { 
                img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
                r: "Admin Portal", 
                d: "Oversee the entire city. Make data-driven operational decisions from a powerful command center." 
              },
              { 
                img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80",
                r: "Field Worker App", 
                d: "Receive optimized routes, clear task instructions, and simple one-tap completion logs on the go." 
              }
            ].map((role, i) => (
              <div
                key={i}
                className="group h-full perspective-[1000px]"
                tabIndex={0}
                aria-label={`Learn more about the ${role.r}`}
              >
                <div className="relative h-full transform-3d transition-transform duration-700 group-hover:transform-[rotateY(180deg)] group-focus:transform-[rotateY(180deg)]">
                  <div className="relative z-10 flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm shadow-black/5 backface-hidden">
                    <img className="h-48 w-full rounded-xl object-cover" src={role.img} alt={role.r} />
                    <p className="ml-2 mt-5 text-xl font-semibold text-gray-900">
                      {role.r}
                    </p>
                    <p className="mb-4 ml-2 mt-2 grow text-sm/6 text-slate-500">
                      {role.d}
                    </p>
                  </div>

                  <div className="absolute inset-0 flex h-full flex-col justify-between rounded-2xl border border-brand-200 bg-brand-950 p-6 text-white backface-hidden transform-[rotateY(180deg)]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">Built for everyone</span>
                      <h3 className="mt-5 text-2xl font-bold tracking-tight">{role.r}</h3>
                      <p className="mt-4 text-sm leading-6 text-brand-100">{role.d}</p>
                    </div>
                    <button type="button" className="mt-8 w-fit rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-white/70">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impact Section */}
      <div className="py-20 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/10 text-center">
            {[
              { v: "94%", l: "Resolution Rate" },
              { v: "2.4h", l: "Avg Response Time" },
              { v: "-40%", l: "Operational Costs" },
              { v: "50+", l: "Cities Onboarded" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">{stat.v}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.l}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest border border-slate-700/50 bg-slate-800/50 px-2.5 py-1 rounded flex items-center justify-center w-fit mx-auto gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div> Demo Data Displayed
            </span>
          </div>
        </div>
      </div>

    </section>
  );
}
