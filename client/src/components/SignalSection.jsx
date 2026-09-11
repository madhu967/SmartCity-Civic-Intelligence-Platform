import React, { useState, useEffect, useRef } from 'react';
import { MapPin, AlertTriangle, Activity, BarChart3, Layers, Map, ArrowRight } from 'lucide-react';

export default function SignalSection() {
  const [activeMarker, setActiveMarker] = useState(0);
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    let animationFrameId;

    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      
      // If the section is in the viewport
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = elementCenter - viewportCenter;
        
        animationFrameId = requestAnimationFrame(() => {
          if (bgRef.current) bgRef.current.style.transform = `translateY(${offset * 0.25}px)`;
          if (leftRef.current) leftRef.current.style.transform = `translateY(${offset * 0.1}px)`;
          if (rightRef.current) rightRef.current.style.transform = `translateY(${offset * -0.15}px)`;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    
    const interval = setInterval(() => {
      setActiveMarker((prev) => (prev + 1) % 3);
    }, 4000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const stats = [
    { label: "Issues Detected", value: "1,204", change: "↑ 12%", trendColor: "text-red-400" },
    { label: "Avg Resolution", value: "4.2h", change: "↓ 8%", trendColor: "text-green-400" },
    { label: "Active Signals", value: "45", change: "Steady", trendColor: "text-gray-400" },
  ];

  const markerData = [
    {
      title: "Pothole Detected",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#4F8CFF]" />,
      dept: "Roads Department",
      reports: "3 duplicates",
      status: "Verifying",
      priority: "Medium"
    },
    {
      title: "High Priority Alert",
      icon: <Activity className="w-3.5 h-3.5 text-[#7C5CFC]" />,
      dept: "Emergency Services",
      reports: "Multiple calls",
      status: "Dispatched",
      priority: "Critical"
    },
    {
      title: "Signal Outage",
      icon: <Map className="w-3.5 h-3.5 text-[#4F8CFF]" />,
      dept: "Traffic Control",
      reports: "5 related issues",
      status: "Investigating",
      priority: "High"
    }
  ];

  const currentMarker = markerData[activeMarker];

  return (
    <section ref={sectionRef} className="sticky top-0 min-h-screen flex items-center justify-center w-full py-20 lg:py-28 overflow-hidden bg-[#080B12] border-t border-white/[0.02] z-0">
      {/* Background glowing effects */}
      <div 
        ref={bgRef}
        className="absolute inset-0 pointer-events-none will-change-transform"
      >
        <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#4F8CFF]/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#7C5CFC]/10 blur-[150px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Content */}
          <div 
            ref={leftRef}
            className="flex flex-col max-w-xl animate-fade-in will-change-transform"
          >
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#4F8CFF]/20 bg-[#4F8CFF]/[0.08] px-3.5 py-1.5 backdrop-blur-sm w-fit">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4F8CFF] opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4F8CFF]"></span>
              </span>
              <span className="text-[11px] font-semibold tracking-wide text-[#4F8CFF] uppercase">Live Intelligence</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Your City Has a <br className="hidden sm:block"/>
              <span className="relative inline-block mt-1">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFC] relative z-10">
                  Signal.
                </span>
                <span className="absolute -bottom-1 left-0 h-2 w-full rounded-full bg-[#7C5CFC]/20" />
              </span>
            </h2>
            
            <p className="mt-5 text-base sm:text-lg text-gray-400 leading-relaxed font-light">
              We turn scattered civic complaints into a unified, real-time map of urban intelligence. Pinpoint priority issues before they escalate, coordinate departments, and save valuable time.
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-8 mt-8 border-t border-white/[0.06]">
              {stats.map((stat, idx) => (
                <div key={idx} className="flex flex-col group">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight group-hover:text-[#4F8CFF] transition-colors duration-300">
                    {stat.value}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">{stat.label}</span>
                  </div>
                  <span className={`text-[10px] font-medium mt-0.5 ${stat.trendColor}`}>
                    {stat.change}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Map/Visual */}
          <div 
            ref={rightRef}
            className="w-full flex items-center justify-center will-change-transform"
          >
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-2xl border border-white/[0.08] bg-[#0F141D] shadow-2xl shadow-black/60 overflow-hidden flex items-center justify-center origin-center transform scale-[0.98] lg:scale-100">
              
              {/* Map Window Chrome */}
            <div className="absolute top-0 inset-x-0 h-10 border-b border-white/[0.06] bg-[#141A24]/80 backdrop-blur-md flex items-center px-4 z-20">
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#FF5F57]/80" />
                <div className="h-2 w-2 rounded-full bg-[#FEBC2E]/80" />
                <div className="h-2 w-2 rounded-full bg-[#28C840]/80" />
              </div>
              <div className="ml-4 flex items-center gap-2 rounded bg-black/40 border border-white/[0.05] px-2.5 py-1">
                <div className="h-1.5 w-1.5 rounded-full bg-[#4F8CFF] animate-pulse" />
                <span className="text-[9px] text-gray-400 font-medium tracking-wide">smartcity.live/map</span>
              </div>
            </div>

            {/* Map inner background */}
            <div className="absolute inset-0 top-10 bg-gradient-to-br from-[#0F141D] to-[#141A24]">
              {/* Map grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(79,140,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(79,140,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
              
              {/* Abstract Roads */}
              <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
                <path d="M 0 40% Q 25% 45%, 50% 30% T 100% 50%" fill="none" stroke="#4F8CFF" strokeWidth="1.5" strokeOpacity="0.3" />
                <path d="M 30% 0 L 30% 100%" fill="none" stroke="#7C5CFC" strokeWidth="1.5" strokeOpacity="0.2" />
                <path d="M 65% 0 Q 70% 50%, 60% 100%" fill="none" stroke="#4F8CFF" strokeWidth="1" strokeOpacity="0.2" />
              </svg>

              {/* Glowing Ambient Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#4F8CFF] rounded-full opacity-[0.05] blur-[60px] animate-pulse"></div>

              {/* Markers */}
              <div className={`absolute top-[35%] left-[25%] transition-all duration-700 ease-in-out ${activeMarker === 0 ? 'scale-110 z-10' : 'scale-90 opacity-40 z-0'}`}>
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border border-white/10 shadow-lg ${activeMarker === 0 ? 'bg-[#4F8CFF]/20 border-[#4F8CFF]/50 shadow-[#4F8CFF]/20' : 'bg-black/40'}`}>
                  <div className={`w-3 h-3 rounded-full ${activeMarker === 0 ? 'bg-[#4F8CFF]' : 'bg-gray-600'}`}></div>
                  {activeMarker === 0 && <span className="absolute w-12 h-12 rounded-full border border-[#4F8CFF] animate-ping opacity-30"></span>}
                </div>
              </div>

              <div className={`absolute top-[55%] left-[65%] transition-all duration-700 ease-in-out ${activeMarker === 1 ? 'scale-110 z-10' : 'scale-90 opacity-40 z-0'}`}>
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border border-white/10 shadow-lg ${activeMarker === 1 ? 'bg-[#7C5CFC]/20 border-[#7C5CFC]/50 shadow-[#7C5CFC]/20' : 'bg-black/40'}`}>
                  <div className={`w-3 h-3 rounded-full ${activeMarker === 1 ? 'bg-[#7C5CFC]' : 'bg-gray-600'}`}></div>
                  {activeMarker === 1 && <span className="absolute w-12 h-12 rounded-full border border-[#7C5CFC] animate-ping opacity-30"></span>}
                </div>
              </div>

              <div className={`absolute top-[25%] left-[75%] transition-all duration-700 ease-in-out ${activeMarker === 2 ? 'scale-110 z-10' : 'scale-90 opacity-40 z-0'}`}>
                <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border border-white/10 shadow-lg ${activeMarker === 2 ? 'bg-[#4F8CFF]/20 border-[#4F8CFF]/50 shadow-[#4F8CFF]/20' : 'bg-black/40'}`}>
                  <div className={`w-3 h-3 rounded-full ${activeMarker === 2 ? 'bg-[#4F8CFF]' : 'bg-gray-600'}`}></div>
                  {activeMarker === 2 && <span className="absolute w-12 h-12 rounded-full border border-[#4F8CFF] animate-ping opacity-30"></span>}
                </div>
              </div>

              {/* Dynamic Floating Info Card */}
              <div className="absolute inset-x-0 bottom-6 flex justify-center z-20 pointer-events-none px-4">
                <div 
                  className="w-full sm:w-[300px] p-4 rounded-xl border border-white/[0.08] shadow-2xl backdrop-blur-xl bg-[#0F141D]/90 transition-all duration-300 transform scale-100" 
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${activeMarker === 1 ? 'bg-[#7C5CFC]/10' : 'bg-[#4F8CFF]/10'}`}>
                        {currentMarker.icon}
                      </div>
                      <h4 className="text-white text-xs font-bold tracking-tight">
                        {currentMarker.title}
                      </h4>
                    </div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-black/50 border border-white/5 text-gray-400">Just Now</span>
                  </div>
                  
                  <div className="space-y-2 mb-3 bg-black/20 rounded-lg p-2.5 border border-white/[0.02]">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-500 font-medium">Status</span>
                      <span className={`font-semibold flex items-center gap-1.5 ${activeMarker === 1 ? 'text-[#7C5CFC]' : 'text-[#4F8CFF]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeMarker === 1 ? 'bg-[#7C5CFC]' : 'bg-[#4F8CFF]'}`}></span>
                        {currentMarker.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-500 font-medium">Department</span>
                      <span className="text-gray-200 font-medium">{currentMarker.dept}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-500 font-medium">Context</span>
                      <span className="text-gray-300">{currentMarker.reports}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 py-1.5 text-[10px] font-bold text-white rounded bg-gradient-to-r from-[#4F8CFF] to-[#3d6ecc] hover:opacity-90 transition-opacity pointer-events-auto flex items-center justify-center gap-1">
                      Assign Crew <ArrowRight className="w-3 h-3" />
                    </button>
                    <button className="flex-1 py-1.5 text-[10px] font-bold text-gray-300 rounded bg-[#141A24] hover:bg-gray-800 transition-colors border border-white/[0.05] pointer-events-auto">
                      View Details
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
