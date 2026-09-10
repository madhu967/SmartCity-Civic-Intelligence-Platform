import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';

export default function Newsletter() {
  return (
    <section className="py-24 bg-white border-t border-slate-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="bg-[#0A1121] rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-slate-800/50 relative">
          
          <div className="lg:w-1/2 relative min-h-[350px] lg:min-h-full">
             <img 
               src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1200" 
               className="absolute inset-0 w-full h-full object-cover" 
               alt="Modern city architecture" 
             />
             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A1121] hidden lg:block"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#0A1121] block lg:hidden"></div>
          </div>
          
          <div className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center relative overflow-hidden bg-[#0A1121]">
             {/* Decorative glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
             
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-brand-300 text-[11px] font-bold uppercase tracking-wider mb-6 w-fit shadow-sm">
               <Mail className="w-3.5 h-3.5" /> Weekly Insights
             </div>
             
             <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-[1.15] mb-4">
               Stay ahead of the <br className="hidden sm:block"/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-sky-400">urban curve.</span>
             </h2>
             <p className="text-slate-400 mb-8 font-light leading-relaxed">
               Get the latest AI-driven civic intelligence strategies, case studies, and feature updates delivered straight to your inbox.
             </p>
             
             <form className="flex flex-col sm:flex-row gap-3 relative z-10" onSubmit={(e) => e.preventDefault()}>
               <div className="flex-1 relative">
                 <input 
                   type="email" 
                   placeholder="Enter your work email" 
                   className="w-full bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-inner"
                   required
                 />
               </div>
               <button type="submit" className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-4 text-sm font-bold text-white transition-all duration-300 hover:bg-brand-500 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                 Subscribe
                 <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
               </button>
             </form>
             <p className="text-[10px] text-slate-500 mt-4">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
