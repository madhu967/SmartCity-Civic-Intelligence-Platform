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
              { i: <Smartphone className="w-6 h-6 text-brand-600" />, r: "Citizen App", d: "Report issues in 3 clicks. Track progress transparently with real-time updates." },
              { i: <MonitorDot className="w-6 h-6 text-teal-600" />, r: "Admin Portal", d: "Oversee the entire city. Make data-driven operational decisions from a powerful command center." },
              { i: <HardHat className="w-6 h-6 text-amber-600" />, r: "Field Worker App", d: "Receive optimized routes, clear task instructions, and simple one-tap completion logs on the go." }
            ].map((role, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-brand-200 transition-all duration-300 text-center flex flex-col items-center shadow-sm">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6 transform -rotate-3">
                  {role.i}
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 mb-2 uppercase tracking-wide">{role.r}</h3>
                <p className="text-[13px] text-slate-500 leading-relaxed font-medium">{role.d}</p>
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
