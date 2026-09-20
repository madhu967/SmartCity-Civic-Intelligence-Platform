import React, { useState } from 'react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I report a civic issue in my neighborhood?",
      answer: "You can submit an issue in under 30 seconds via the Citizen Portal or AI Vision Report. Simply snap or upload a photo of the problem (such as potholes, water leaks, broken streetlights, or waste accumulation), provide an optional description, and submit. The platform automatically pins your geolocation.",
    },
    {
      question: "How does the AI verify and prioritize reports?",
      answer: "When you submit a report, our multi-modal AI vision model inspects the image to verify the issue category, detect duplicate reports within the immediate vicinity, estimate safety hazards, and calculate an automated urgency score for rapid dispatch.",
    },
    {
      question: "Can I track the status of my report in real time?",
      answer: "Yes! Every report receives a live civic tracking timeline. You will receive transparent status updates as municipal administrators review the report, dispatch field workers, and upload photo proof upon resolution.",
    },
    {
      question: "Who handles issue resolution and worker dispatching?",
      answer: "Verified reports are automatically routed to the responsible municipal department (Roads & Transport, Water Works, Sanitation, or Electrical Grid). Department administrators assign field crews based on proximity and workload.",
    },
    {
      question: "Is my personal identity and data kept secure?",
      answer: "Absolutely. Citizen privacy is built into the core platform. Your personal credentials and contact details are strictly encrypted and anonymized on public heatmaps. Only verified municipal staff have access to dispatch records.",
    },
  ];

  return (
    <section id="faq" className="faq-section relative z-10 py-24 bg-slate-50/60 border-t border-slate-100 overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&display=swap');

        .faq-section, .faq-section * {
          font-family: 'Poppins', sans-serif !important;
        }
      `}</style>

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-center gap-10 px-4 md:px-6">
        {/* Left Side: Civic Support / Inquiry Photo */}
        <div className="w-full md:w-[380px] shrink-0 relative">
          <img
            className="w-full rounded-2xl h-[460px] object-cover shadow-lg border border-slate-200/80"
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=900&auto=format&fit=crop"
            alt="Smart City Civic Help & Support"
            loading="lazy"
          />
          {/* Civic Assistance floating badge */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-md border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-bold shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Civic Support Desk
              </div>
              <div className="text-[11px] text-slate-500">24/7 AI-driven assistance & dispatch</div>
            </div>
          </div>
        </div>

        {/* Right Side: Accordion Content */}
        <div className="flex-1 w-full">
          <p className="text-brand-600 text-sm font-semibold tracking-wide uppercase">FAQ's</p>
          <h2 className="text-3xl font-semibold text-slate-900 mt-1">Looking for answer?</h2>
          <p className="text-sm text-slate-500 mt-2 pb-4 leading-relaxed">
            Find instant answers to common questions about reporting local infrastructure issues, AI automated verification, and department resolution workflows.
          </p>

          <div className="divide-y divide-slate-200">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  className="py-4 cursor-pointer group transition-colors"
                  key={index}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className={`text-base font-medium transition-colors ${isOpen ? "text-brand-600 font-semibold" : "text-slate-800 group-hover:text-brand-600"}`}>
                      {faq.question}
                    </h3>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`${isOpen ? "rotate-180 text-brand-600" : "text-slate-400 group-hover:text-slate-700"} shrink-0 transition-transform duration-300 ease-in-out`}
                    >
                      <path
                        d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "opacity-100 max-h-[300px] translate-y-0 pt-3" : "opacity-0 max-h-0 -translate-y-1 pointer-events-none"
                    }`}
                  >
                    <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
