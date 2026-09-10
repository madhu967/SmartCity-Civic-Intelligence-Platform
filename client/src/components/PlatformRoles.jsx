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
              <div key={i} className="p-4 bg-white border border-gray-200 hover:-translate-y-1 transition duration-300 rounded-2xl shadow-sm hover:shadow-lg shadow-black/5 w-full flex flex-col h-full">
                  <img className="rounded-xl h-48 w-full object-cover" src={role.img} alt={role.r} />
                  <p className="text-gray-900 text-xl font-semibold ml-2 mt-5">
                      {role.r}
                  </p>
                  <p className="text-slate-500 text-sm/6 mt-2 ml-2 mb-4 flex-grow">
                      {role.d}
                  </p>
                  <button type="button" className="bg-brand-600 hover:bg-brand-700 transition cursor-pointer mt-auto mb-2 ml-2 mr-2 px-6 py-2.5 font-semibold rounded-xl text-white text-sm w-fit self-start">
                      Learn More
                  </button>
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
