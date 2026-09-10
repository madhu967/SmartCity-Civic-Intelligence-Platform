import React from 'react';
import { Smartphone, Sparkles, AlertOctagon, Layers, UserCheck, CheckCircle2 } from 'lucide-react';

export default function WorkflowSection() {
  const steps = [
    { icon: <Smartphone className="w-5 h-5 text-sky-500" />, title: "Report", desc: "Citizen submits via app" },
    { icon: <Sparkles className="w-5 h-5 text-brand-500" />, title: "AI Triage", desc: "Auto-classification" },
    { icon: <AlertOctagon className="w-5 h-5 text-rose-500" />, title: "Priority", desc: "Severity scored" },
    { icon: <Layers className="w-5 h-5 text-amber-500" />, title: "De-dupe", desc: "Matches existing" },
    { icon: <UserCheck className="w-5 h-5 text-teal-500" />, title: "Assign", desc: "Routed to crew" },
    { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, title: "Resolve", desc: "Citizen notified" },
  ];

  return (
    <section className="py-24 bg-brand-50 relative overflow-hidden border-t border-brand-100">
      {/* Decorative Background */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-300 to-transparent"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-200/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* AI Intelligence Layer Flow */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-600 text-[11px] font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" /> AI Intelligence Layer
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Zero manual triage. <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-sky-500">
              Instant assignment.
            </span>
          </h2>
        </div>

        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 hidden lg:block rounded-full"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 relative z-10">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                  {step.icon}
                </div>
                <h3 className="text-[13px] font-bold text-slate-800 mb-1">{step.title}</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* One Issue Full Journey Timeline */}
        <div className="mt-32 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="max-w-md mx-auto lg:mx-0">
            <h3 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">One Issue. <span className="text-brand-600">Full Journey.</span></h3>
            <p className="text-base text-slate-500 mb-10 leading-relaxed font-light">
              Watch how a single report moves seamlessly from a citizen's smartphone to a resolved city improvement, orchestrated entirely by SmartCity AI.
            </p>

            <div className="space-y-8 relative border-l-2 border-slate-100 ml-3 pl-8">
              <div className="relative">
                <span className="absolute -left-[39px] top-1 h-3.5 w-3.5 rounded-full border-[3px] border-sky-500 bg-white"></span>
                <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">08:14 AM — Citizen App</div>
                <h4 className="text-sm font-bold text-slate-800">Pothole Reported</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Photo uploaded with precise GPS coordinates.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[39px] top-1 h-3.5 w-3.5 rounded-full border-[3px] border-brand-500 bg-white"></span>
                <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">08:15 AM — AI Layer</div>
                <h4 className="text-sm font-bold text-slate-800">Categorized & Prioritized</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">AI detects severity, merges with 2 existing duplicate reports.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[39px] top-1 h-3.5 w-3.5 rounded-full border-[3px] border-amber-500 bg-white"></span>
                <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">08:16 AM — Command Center</div>
                <h4 className="text-sm font-bold text-slate-800">Auto-Assigned to Crew</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Routed to the nearest Roads Dept crew with optimal pathing.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[39px] top-1 h-3.5 w-3.5 rounded-full border-[3px] border-emerald-500 bg-white shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <div className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">11:30 AM — Field Worker</div>
                <h4 className="text-sm font-bold text-slate-800">Issue Resolved</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Worker marks complete. Citizen receives a thank-you photo.</p>
              </div>
            </div>
          </div>
          
          <div className="relative rounded-2xl bg-slate-50 border border-slate-200/60 shadow-inner p-6 md:p-10 overflow-hidden flex flex-col justify-center max-w-md mx-auto lg:mx-0 w-full">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            <div className="relative z-10 flex flex-col gap-3 w-full">
              {/* Card 1 */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  <img src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=100&h=100" className="w-full h-full object-cover" alt="pothole" />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">New Report</div>
                  <div className="text-xs font-bold text-slate-800">Deep Pothole on 5th Ave</div>
                </div>
              </div>
              <div className="w-0.5 h-4 bg-slate-200 mx-auto"></div>
              
              {/* Card 2 */}
              <div className="bg-white p-4 rounded-xl shadow-lg shadow-brand-500/10 border border-brand-100 flex items-center justify-between transform scale-[1.02]">
                <div className="flex items-center gap-2.5">
                  <div className="bg-brand-50 p-1.5 rounded-md">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">AI Analysis Complete</span>
                </div>
                <span className="text-[9px] font-extrabold px-2 py-1 bg-rose-50 text-rose-600 rounded uppercase tracking-wider">High Severity</span>
              </div>
              <div className="w-0.5 h-4 bg-slate-200 mx-auto"></div>
              
              {/* Card 3 */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between opacity-80">
                <div className="flex items-center gap-2.5">
                  <div className="bg-teal-50 p-1.5 rounded-md">
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-800">Crew Assigned</span>
                </div>
                <div className="flex -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 border-2 border-white"></div>
                  <div className="w-5 h-5 rounded-full bg-slate-300 border-2 border-white"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
