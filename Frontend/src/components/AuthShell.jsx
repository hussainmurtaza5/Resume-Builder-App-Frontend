import { Check, LayoutTemplate, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react';
import Logo from './Logo';

const highlights = [
  {
    icon: WandSparkles,
    title: 'AI bullet writer',
    body: 'Turn one line about the job into sharp, quantified achievements.',
  },
  {
    icon: ShieldCheck,
    title: 'Live ATS scoring',
    body: 'Watch your score climb as you type — exactly what recruiters parse.',
  },
  {
    icon: LayoutTemplate,
    title: '120+ templates',
    body: 'Every layout is ATS-safe and prints to a single crisp page.',
  },
];

const avatars = ['/images/avatar-1.jpg', '/images/avatar-2.jpg', '/images/avatar-3.jpg', '/images/avatar-4.jpg'];

export default function AuthShell({ children, eyebrow, title, highlight, subtitle }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-slate-900 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0 homepage-honeycomb opacity-[0.12]" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-28 -top-24 h-96 w-96 rounded-full bg-amber-400/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-yellow-300/10 blur-3xl"
        />

        <div className="relative z-[1] flex h-full flex-col px-12 py-12">
          <Logo to="/homepage" className="text-white [&_span]:text-white" />

          <div className="mt-14 max-w-md">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-300">
              <Sparkles size={14} />
              {eyebrow}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight">
              {title}{' '}
              <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
                {highlight}
              </span>
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-slate-300">{subtitle}</p>
          </div>

          <ul className="mt-10 space-y-4">
            {highlights.map(({ icon: Icon, title: itemTitle, body }) => (
              <li key={itemTitle} className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-amber-300">
                  <Icon size={19} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-white">{itemTitle}</span>
                  <span className="mt-0.5 block text-[13px] leading-6 text-slate-400">{body}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-10">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }, (_, index) => (
                  <span key={index} className="text-xs">
                    ★
                  </span>
                ))}
              </div>
              <p className="mt-2.5 text-sm leading-6 text-slate-200">
                “I rebuilt my resume in an evening and booked three interviews the next
                week. The live preview alone was worth it.”
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {avatars.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      loading="lazy"
                      className="h-8 w-8 rounded-full border-2 border-slate-900 object-cover"
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  Trusted by 100,000+ job seekers
                </span>
              </div>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-slate-400">
              <Check size={14} className="text-emerald-400" />
              No credit card required · Export to PDF & DOCX
            </p>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="relative flex min-h-screen flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-5 lg:hidden">
          <Logo to="/homepage" />
          <span className="text-xs font-semibold text-slate-500">100,000+ job seekers</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-8 sm:px-10">
          <div className="w-full max-w-[26rem]">{children}</div>
        </div>

        <footer className="px-6 pb-6 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} Resumbee Labs ·{' '}
          <a href="mailto:hello@resumbee.app" className="hover:text-amber-600">
            hello@resumbee.app
          </a>
        </footer>
      </main>
    </div>
  );
}
