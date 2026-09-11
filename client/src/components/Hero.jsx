import { ArrowRight, Play, Shield, Zap, TrendingUp } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative flex flex-col overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white pt-32 lg:pt-40">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute -left-48 top-20 h-[500px] w-[500px] rounded-full bg-brand-100/30 blur-[100px]" />
        <div className="absolute -right-48 top-40 h-[400px] w-[400px] rounded-full bg-sky-100/40 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[600px] rounded-full bg-teal-50/40 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">
          {/* Left Content */}
          <div className="max-w-xl animate-slide-up">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-brand-200/60 bg-brand-50/60 px-4 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-brand-700">
                AI-Powered Civic Intelligence Platform
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-5xl xl:text-[3.25rem]">
              Building{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-brand-700 via-brand-600 to-sky-500 bg-clip-text text-transparent">
                  Smarter Cities
                </span>
                <span className="absolute -bottom-1 left-0 h-3 w-full rounded-full bg-brand-100/70" />
              </span>
              <br />
              One Report at a Time
            </h1>

            {/* Description */}
            <p className="mt-6 text-base leading-relaxed text-slate-500 sm:text-lg sm:leading-relaxed">
              Empower citizens to report civic issues instantly. Our AI analyzes,
              prioritizes, and routes problems to the right department — turning
              complaints into action within hours, not weeks.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#report"
                className="group inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-brand-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-2xl hover:shadow-brand-600/30 active:translate-y-0"
              >
                Report an Issue
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="#demo"
                className="group inline-flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg active:translate-y-0"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 transition-colors duration-200 group-hover:bg-brand-50">
                  <Play className="ml-0.5 h-3 w-3 text-slate-600 group-hover:text-brand-600" fill="currentColor" />
                </span>
                Watch Demo
              </a>
            </div>

          </div>

          {/* Right — Image Visual */}
          <div className="relative animate-fade-in lg:ml-auto max-w-lg mx-auto transform flex justify-center items-center mt-12 lg:mt-0">
             {/* Brand Theme blob background */}
             <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[320px] h-[300px] sm:w-[420px] sm:h-[400px] bg-gradient-to-tr from-brand-300 to-sky-200 -z-10" 
                style={{ 
                  borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                  clipPath: 'inset(0 0 15% 0)'
                }}
             />

             {/* Left curved line decoration */}
             <svg className="absolute -left-4 sm:-left-8 top-[30%] w-10 sm:w-12 h-24 sm:h-32 text-brand-200 -z-10" viewBox="0 0 50 150" fill="none">
               <path d="M 45 5 Q 5 75 45 145" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
             </svg>

             {/* Main Portrait Image (Civic worker in uniform with transparent background) */}
             <img 
               src="https://wsrv.nl/?url=https://pngimg.com/uploads/industrial_worker/industrial_worker_PNG11448.png&output=png" 
               alt="Civic Worker in Uniform" 
               className="relative z-0 w-full max-w-[280px] sm:max-w-[380px] object-contain drop-shadow-2xl translate-y-4 scale-110"
             />

             {/* Circular Badge - Top Right */}
             <div className="absolute top-[5%] right-[-5%] sm:right-[-8%] w-20 h-20 sm:w-28 sm:h-28 bg-brand-900 rounded-full flex items-center justify-center text-white z-20 shadow-xl border-[3px] border-white">
               {/* Text rotating around */}
               <div className="absolute inset-0 animate-[spin_12s_linear_infinite]">
                 <svg viewBox="0 0 100 100" className="w-full h-full text-[10px] sm:text-[10px] font-bold tracking-[0.15em] fill-current">
                   <path id="curve" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                   <text>
                     <textPath href="#curve" startOffset="0">
                       • CIVIC AI • CIVIC AI • CIVIC AI
                     </textPath>
                   </text>
                 </svg>
               </div>
               {/* Inner Arrow */}
               <div className="w-6 h-6 sm:w-8 sm:h-8 bg-brand-500 rounded-full flex items-center justify-center text-white -rotate-45">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
               </div>
             </div>

             {/* Light Pill - Right */}
             <div className="absolute bottom-[20%] right-[-5%] sm:right-[-12%] flex flex-col items-center gap-1 z-20 animate-float">
               <div className="bg-white text-brand-700 font-bold px-4 py-2 sm:px-6 sm:py-2.5 rounded-full shadow-xl text-xs sm:text-sm border-2 border-brand-100">
                 City Planner
               </div>
               {/* Cursor Arrow pointing UP LEFT */}
               <svg className="w-5 h-5 sm:w-6 sm:h-6 text-brand-500 drop-shadow-md -translate-x-6 sm:-translate-x-8 -translate-y-12 sm:-translate-y-14" viewBox="0 0 16 22" fill="currentColor">
                 <path d="M0 0l15.5 10.5-6.5 1 4.5 8-2.5 1.5-4.5-8-5 5.5v-18z" stroke="white" strokeWidth="1"/>
               </svg>
             </div>

             {/* Dark Pill - Left */}
             <div className="absolute bottom-[5%] left-[-10%] sm:left-[-15%] flex flex-col items-center gap-1 z-20 animate-float-delayed">
               {/* Cursor Arrow pointing UP RIGHT */}
               <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 drop-shadow-md translate-x-12 sm:translate-x-16 translate-y-3 sm:translate-y-3" viewBox="0 0 16 22" fill="currentColor" style={{transform: 'scaleX(-1) rotate(-15deg)'}}>
                 <path d="M0 0l15.5 10.5-6.5 1 4.5 8-2.5 1.5-4.5-8-5 5.5v-18z" stroke="white" strokeWidth="1"/>
               </svg>
               <div className="bg-slate-900 text-white font-bold px-4 py-2 sm:px-6 sm:py-2.5 rounded-full shadow-xl text-xs sm:text-sm border-2 border-white">
                 Civic Engineer
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="relative w-full h-16 sm:h-20 z-30 flex items-center justify-center mt-2 lg:mt-4">
        {/* Slanted Accent Background */}
         <div className="absolute w-[110%] h-10 sm:h-12 bg-brand-600 rotate-[-3.5deg] z-0 shadow-lg origin-center"></div>
         
         {/* Horizontal Primary Marquee */}
         <div className="absolute w-full h-10 sm:h-12 bg-brand-800 z-10 flex flex-col justify-center shadow-xl border-y border-brand-600/40">
            <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
               {/* Repeat array for seamless continuous loop */}
               {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center whitespace-nowrap">
                    {['Civic Intelligence', 'Real-time Alerts', 'Incident Reporting', 'City Dashboard', 'Smart Dispatch', 'AI Analytics'].map((text, idx) => (
                      <div key={idx} className="flex items-center text-white font-extrabold text-xs sm:text-sm tracking-widest uppercase px-5 sm:px-8">
                        {text}
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mx-5 sm:mx-8 text-brand-300" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ))}
                  </div>
               ))}
            </div>
         </div>
      </div>
    </section>
  );
}
