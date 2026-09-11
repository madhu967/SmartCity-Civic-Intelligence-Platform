import React, { useState } from 'react';
import { ArrowUpRight, Building2, Eye, Globe2, Users } from 'lucide-react';

const principles = [
  {
    id: 'people',
    label: 'People first',
    title: 'Technology that feels human.',
    description: 'Every signal starts with a person. We give communities a clearer voice and city teams the context to act with care.',
    icon: Users,
  },
  {
    id: 'clarity',
    label: 'Radical clarity',
    title: 'Complex cities, simple decisions.',
    description: 'We turn noise into a shared operating picture, so the right team sees the right problem at the right moment.',
    icon: Eye,
  },
  {
    id: 'scale',
    label: 'Built to scale',
    title: 'Small fixes. City-wide impact.',
    description: 'A flexible intelligence layer helps every department move faster without asking cities to replace what already works.',
    icon: Globe2,
  },
];

export default function AboutSection() {
  const [activePrinciple, setActivePrinciple] = useState('people');
  const active = principles.find((principle) => principle.id === activePrinciple);
  const ActiveIcon = active.icon;

  return (
    <section id="about" className="relative overflow-hidden border-b border-brand-100 bg-brand-50 py-24 text-slate-900 lg:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-slate-300 to-transparent" />
      <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 flex flex-col justify-between gap-8 lg:mb-24 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <div className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-brand-600">
              <span className="h-px w-10 bg-brand-600" />
              About Civic Intelligence
            </div>
            <h2 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-brand-950 sm:text-5xl lg:text-6xl">
              Cities are alive.{' '}
              <span className="font-normal italic text-brand-600">We help them listen.</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-7 text-slate-600 lg:mb-2">
            Civic Intelligence connects the lived experience of a city to the people responsible for making it better.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-130 overflow-hidden rounded-4xl bg-brand-950 p-7 text-white sm:p-10">
            <img
              src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&q=85&w=1400"
              alt="Aerial view of a connected city grid"
              className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-linear-to-t from-brand-950 via-brand-900/75 to-transparent" />
            <div className="relative flex h-full min-h-115 flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-sm">
                  Our point of view
                </span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div>
                <div className="mb-5 flex items-center gap-2 text-xs text-brand-200">
                  <span className="h-2 w-2 rounded-full bg-brand-400 shadow-[0_0_0_5px_rgba(96,165,250,0.2)]" />
                  Designing for the everyday
                </div>
                <p className="max-w-lg text-2xl font-medium leading-tight tracking-tight sm:text-4xl">
                  “The best civic technology makes progress visible to everyone.”
                </p>
                <div className="mt-8 flex items-center gap-3 text-xs text-brand-200">
                  <span className="h-px w-8 bg-brand-400" />
                  The Civic Intelligence team
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="grid flex-1 grid-cols-2 gap-5">
              <div className="relative min-h-60 overflow-hidden rounded-4xl bg-brand-100 p-6">
                <img
                  src="https://images.unsplash.com/photo-1494522358652-f30e61a60313?auto=format&fit=crop&q=85&w=800"
                  alt="Sunlit residential street"
                  className="absolute inset-0 h-full w-full object-cover mix-blend-multiply opacity-70"
                />
                <div className="relative flex h-full flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-900">Since 2018</span>
                  <p className="max-w-37.5 text-2xl font-bold leading-none tracking-tight text-brand-900">Built for the places we call home.</p>
                </div>
              </div>
              <div className="flex min-h-60 flex-col justify-between rounded-4xl bg-brand-200 p-6 text-brand-950">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Our reach</span>
                  <ArrowUpRight className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-6xl font-bold tracking-[-0.08em]">40<span className="text-3xl">+</span></div>
                  <p className="mt-1 max-w-35 text-xs font-medium leading-5">cities turning insight into action</p>
                </div>
              </div>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(16,37,28,0.06)] sm:p-8">
              <div className="mb-7 flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">What guides us</span>
                <div className="h-px flex-1 bg-slate-100" />
                <ActiveIcon className="h-4 w-4 text-brand-600" />
              </div>
              <div className="mb-6 flex flex-wrap gap-2">
                {principles.map((principle) => (
                  <button
                    key={principle.id}
                    type="button"
                    onClick={() => setActivePrinciple(principle.id)}
                    className={`rounded-full border px-3.5 py-2 text-[11px] font-semibold transition-colors ${activePrinciple === principle.id ? 'border-brand-900 bg-brand-900 text-white' : 'border-slate-200 text-slate-500 hover:border-brand-600 hover:text-brand-900'}`}
                  >
                    {principle.label}
                  </button>
                ))}
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-brand-950">{active.title}</h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">{active.description}</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}