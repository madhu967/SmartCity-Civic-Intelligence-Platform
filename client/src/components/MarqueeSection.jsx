import React from 'react';

export default function MarqueeSection() {
    const [stopScroll, setStopScroll] = React.useState(false);
    const cardData = [
        {
            title: "Real-Time Urban Analytics",
            image: "https://images.unsplash.com/photo-1496062031456-07b8f162a322?w=1200&auto=format&fit=crop&q=80",
        },
        {
            title: "Automated Issue Triage",
            image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&auto=format&fit=crop&q=80",
        },
        {
            title: "Optimized Crew Routing",
            image: "https://images.unsplash.com/photo-1541888081688-662da07a755d?w=1200&auto=format&fit=crop&q=80",
        },
        {
            title: "Data-Driven Decisions",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
        },
        {
            title: "Engaged Communities",
            image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80",
        }
    ];

    return (
        <section className="relative z-10 py-16 bg-white border-t border-slate-100 overflow-hidden shadow-2xl">
            <style>{`
                .marquee-inner {
                    animation: marqueeScroll linear infinite;
                }
                @keyframes marqueeScroll {
                    0% {
                        transform: translateX(0%);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
            
            <div className="text-center mb-10 max-w-3xl mx-auto px-6">
               <h3 className="text-[11px] font-extrabold text-brand-600 uppercase tracking-widest mb-3">City Infrastructure</h3>
               <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Powering the cities of tomorrow.</h2>
            </div>

            <div 
               className="overflow-hidden w-full relative max-w-7xl mx-auto" 
               onMouseEnter={() => setStopScroll(true)} 
               onMouseLeave={() => setStopScroll(false)}
            >
                <div className="absolute left-0 top-0 h-full w-20 md:w-32 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
                <div className="marquee-inner flex w-fit" style={{ animationPlayState: stopScroll ? "paused" : "running", animationDuration: cardData.length * 3000 + "ms" }}>
                    <div className="flex">
                        {[...cardData, ...cardData].map((card, index) => (
                            <div key={index} className="w-64 sm:w-80 mx-4 h-[22rem] relative group hover:scale-95 transition-transform duration-500 rounded-2xl overflow-hidden shadow-lg border border-slate-100 cursor-pointer">
                                <img src={card.image} alt={card.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                <div className="flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 absolute bottom-0 left-0 w-full h-full bg-slate-900/40 backdrop-blur-sm">
                                    <p className="text-white text-xl font-bold text-center tracking-tight">{card.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute right-0 top-0 h-full w-20 md:w-32 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
            </div>
        </section>
    );
}
