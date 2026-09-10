import React from 'react';
import { Box, Globe, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative bg-[#080B12] pt-24 pb-12 overflow-hidden border-t border-white/[0.02]">
      {/* Huge Transparent Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none overflow-hidden opacity-[0.04]">
        <h1 className="text-[18vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent tracking-tighter leading-none">
          SMARTCITY
        </h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-16">
          <div className="md:col-span-1">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-sky-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                  <Box className="w-5 h-5 text-white fill-white/20" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">SmartCity.</span>
             </div>
             <p className="text-sm text-slate-400 font-light leading-relaxed">
               Next-generation civic intelligence platform powered by AI. Building smarter, safer, and more efficient cities for everyone.
             </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6 text-sm tracking-wide uppercase">Platform</h4>
            <ul className="space-y-4">
              {['Features', 'Command Center', 'Citizen App', 'Field Worker App', 'Pricing'].map(item => (
                <li key={item}><a href="#" className="text-slate-400 hover:text-brand-400 transition-colors text-sm font-medium">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm tracking-wide uppercase">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Careers', 'Blog', 'Contact', 'Partners'].map(item => (
                <li key={item}><a href="#" className="text-slate-400 hover:text-brand-400 transition-colors text-sm font-medium">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm tracking-wide uppercase">Legal</h4>
            <ul className="space-y-4">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(item => (
                <li key={item}><a href="#" className="text-slate-400 hover:text-brand-400 transition-colors text-sm font-medium">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} SmartCity Intelligence Inc. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-white transition-all">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-white transition-all">
              <MessageCircle className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-brand-500 hover:text-white transition-all">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
