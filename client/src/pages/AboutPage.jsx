import {
  ArrowRight,
  Building2,
  Globe2,
  HeartHandshake,
  Lightbulb,
  MoveUpRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const principles = [
  {
    icon: HeartHandshake,
    label: "Human at the center",
    text: "Every signal begins with a lived experience. We design technology that helps people feel heard, informed, and part of progress.",
  },
  {
    icon: Lightbulb,
    label: "Clarity over complexity",
    text: "Cities generate more data than ever. We turn that noise into a shared picture teams can understand and act on quickly.",
  },
  {
    icon: Globe2,
    label: "Progress that compounds",
    text: "Small improvements become meaningful when every department, neighborhood, and resident can move in the same direction.",
  },
];

const milestones = [
  { year: "2018", title: "A better civic signal", text: "SmartCity begins with one simple idea: every report deserves a clear path to action." },
  { year: "2021", title: "From reports to patterns", text: "Machine intelligence helps city teams see the bigger picture across neighborhoods and departments." },
  { year: "Today", title: "Cities in conversation", text: "Communities and crews now share one living operating picture, from first report to final resolution." },
];

export default function AboutPage({ isAuthenticated = false, user = null, onLogout = () => {} }) {
  return (
    <div className="min-h-screen bg-[#f6f8f7] text-slate-900">
      <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={onLogout} />

      <main>
        <section className="border-b border-slate-200 bg-[#f6f8f7] pb-16 pt-32 lg:pb-24 lg:pt-40">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20 lg:px-8">
            <div className="max-w-2xl">
              <div className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-600">
                <span className="h-px w-9 bg-brand-600" />
                About SmartCity
              </div>
              <h1 className="max-w-xl text-4xl font-bold leading-[1.05] tracking-tight text-brand-950 sm:text-5xl lg:text-6xl">
                Better cities begin with <span className="font-normal italic text-brand-600">better listening.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                We connect the everyday experience of residents with the people responsible for making cities work better. One clear signal at a time.
              </p>
              <a href="#story" className="mt-8 inline-flex items-center gap-3 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700">
                Meet the thinking behind it
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="relative aspect-[1.12] overflow-hidden rounded-3xl border border-slate-200 bg-slate-200 shadow-xl shadow-slate-900/10">
                <img
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=85&w=1200"
                  alt="City team collaborating around a table"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-brand-950/80 to-transparent p-6 pt-20">
                  <p className="max-w-sm text-lg font-medium leading-tight text-white sm:text-xl">A city is not a dashboard. It is a conversation.</p>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:-left-7">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <MoveUpRight className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-lg font-bold leading-none text-brand-950">40+</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">cities connected</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="story" className="relative bg-white py-24 lg:py-36">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-600">Why we exist</p>
              <h2 className="mt-5 max-w-sm text-4xl font-bold leading-tight tracking-tight text-brand-950 sm:text-5xl">The distance between a problem and a solution matters.</h2>
            </div>
            <div className="max-w-2xl">
              <p className="text-2xl font-medium leading-snug tracking-tight text-slate-800 sm:text-4xl">
                A pothole, a broken light, a missed collection. To a resident, these are small moments with a big effect on daily life.
              </p>
              <p className="mt-8 text-base leading-8 text-slate-500">
                To a city team, they can arrive as disconnected reports, duplicate requests, and urgent work buried in a crowded queue. SmartCity brings those two realities together. We make the signal clearer for residents and the next action more obvious for the teams who serve them.
              </p>
              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {[
                  ["94%", "resolution rate"],
                  ["2.4h", "average response"],
                  ["50+", "cities onboarded"],
                ].map(([value, label]) => (
                  <div key={label} className="border-t-2 border-brand-200 pt-4">
                    <div className="text-3xl font-bold tracking-tight text-brand-950">{value}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-brand-50 py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-600">Our point of view</p>
                <h2 className="mt-4 max-w-xl text-4xl font-bold leading-tight tracking-tight text-brand-950 sm:text-5xl">Technology should feel like a helping hand.</h2>
              </div>
              <p className="max-w-xs text-sm leading-7 text-slate-500">Quietly powerful infrastructure for the people doing the visible work of improving a city.</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {principles.map((principle, index) => {
                const Icon = principle.icon;
                return (
                  <article key={principle.label} className={`group relative overflow-hidden rounded-[1.75rem] p-7 ${index === 1 ? "bg-brand-950 text-white" : "bg-white text-brand-950"}`}>
                    <div className="mb-20 flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${index === 1 ? "bg-white/10 text-brand-300" : "bg-brand-50 text-brand-600"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${index === 1 ? "text-brand-300" : "text-slate-400"}`}>0{index + 1}</span>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">{principle.label}</h3>
                    <p className={`mt-4 text-sm leading-7 ${index === 1 ? "text-slate-300" : "text-slate-500"}`}>{principle.text}</p>
                    <div className={`mt-8 h-px w-14 transition-all duration-500 group-hover:w-full ${index === 1 ? "bg-brand-400" : "bg-brand-300"}`} />
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white py-24 lg:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -bottom-5 -right-5 h-40 w-40 rounded-full border border-brand-200" />
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&q=85&w=1200"
                alt="City team collaborating around a table"
                className="relative aspect-[1.15] w-full rounded-4xl object-cover"
              />
              <div className="absolute -bottom-8 left-6 max-w-60 rounded-2xl bg-brand-600 p-5 text-white shadow-xl sm:left-10">
                <Building2 className="mb-5 h-5 w-5 text-brand-200" />
                <p className="text-sm font-semibold leading-6">Designed with the people who keep cities moving.</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-600">The journey so far</p>
              <h2 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-brand-950 sm:text-5xl">Built with the city, not just for it.</h2>
              <div className="mt-10 space-y-8">
                {milestones.map((milestone) => (
                  <div key={milestone.year} className="flex gap-5">
                    <div className="w-14 shrink-0 pt-1 text-xs font-bold text-brand-600">{milestone.year}</div>
                    <div className="border-l border-slate-200 pl-5">
                      <h3 className="text-lg font-bold text-slate-900">{milestone.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{milestone.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#0b1720] py-20 text-white lg:py-24">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-6 lg:flex-row lg:items-center lg:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-300">The next signal</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">Make the next improvement visible.</h2>
            </div>
            <a href="/#report" className="inline-flex w-fit items-center gap-3 rounded-full bg-brand-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-400">
              Explore the platform
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
