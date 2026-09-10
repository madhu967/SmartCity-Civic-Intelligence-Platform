import React from 'react';
import { Map, BrainCircuit, ShieldAlert, CopyMinus, LineChart } from 'lucide-react';

export default function CommandCenter() {
  return (
    <section className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-50/50 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-4">
            City Command Center
          </h2>
          <p className="text-slate-500 text-lg font-light leading-relaxed">
            A bird's-eye view of your entire city's health. Real-time maps, advanced analytics, and AI-driven insights—all in one place.
          </p>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="w-full rounded-2xl bg-white border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.06)] overflow-hidden mb-24">
          <div className="flex items-center px-4 py-3 border-b border-slate-100 bg-slate-50/80 backdrop-blur-sm">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
            </div>
            <div className="mx-auto bg-white border border-slate-200 px-4 py-1 rounded-md text-[10px] font-semibold text-slate-400 shadow-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              admin.smartcity.gov/overview
            </div>
          </div>
          <div className="p-6 md:p-8 bg-slate-50/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Reports', val: '12,405', trend: 'text-brand-600' },
                { label: 'Resolution Rate', val: '94.2%', trend: 'text-emerald-500' },
                { label: 'Avg Time to Fix', val: '1.2 Days', trend: 'text-teal-500' },
                { label: 'Active Crews', val: '48', trend: 'text-amber-500' },
              ].map((s, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{s.label}</div>
                  <div className={`text-2xl font-black ${s.trend}`}>{s.val}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm h-64 md:h-80 relative overflow-hidden flex items-center justify-center bg-slate-50/80">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                <Map className="w-12 h-12 text-slate-200 absolute" />
                <div className="absolute top-[30%] left-[40%] w-32 h-32 bg-rose-500/15 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute top-[50%] left-[60%] w-24 h-24 bg-amber-500/15 rounded-full blur-2xl"></div>
                <div className="absolute bottom-[20%] left-[20%] w-40 h-40 bg-teal-500/10 rounded-full blur-2xl"></div>
              </div>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
                 <div className="text-xs font-extrabold text-slate-800 mb-6 uppercase tracking-wider">Issues by Department</div>
                 <div className="space-y-4">
                   {[
                     { d: 'Roads & Streets', p: '45%', c: 'bg-brand-500' },
                     { d: 'Sanitation', p: '25%', c: 'bg-teal-500' },
                     { d: 'Utilities', p: '20%', c: 'bg-amber-500' },
                     { d: 'Parks & Rec', p: '10%', c: 'bg-emerald-500' },
                   ].map((item, i) => (
                     <div key={i}>
                       <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                         <span>{item.d}</span><span className="text-slate-800">{item.p}</span>
                       </div>
                       <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                         <div className={`h-full ${item.c} rounded-full`} style={{ width: item.p }}></div>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI That Understands the City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { i: <BrainCircuit className="w-5 h-5 text-brand-600" />, t: "Smart Classification", d: "Auto-routes issues to the correct department instantly based on NLP context." },
            { i: <ShieldAlert className="w-5 h-5 text-rose-500" />, t: "Severity Scoring", d: "Identifies emergencies like gas leaks and bumps them to the top of the queue." },
            { i: <CopyMinus className="w-5 h-5 text-amber-500" />, t: "Duplicate Detection", d: "Merges identical reports (like 10 photos of the same pothole) into 1 task." },
            { i: <LineChart className="w-5 h-5 text-teal-500" />, t: "Predictive Insights", d: "Highlights seasonal trends and helps forecast future maintenance needs." },
          ].map((feat, i) => (
            <div key={i} className="flex flex-col group">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                {feat.i}
              </div>
              <h4 className="text-[13px] font-extrabold text-slate-900 mb-2">{feat.t}</h4>
              <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{feat.d}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
