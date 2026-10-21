import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  CheckCircle2,
  FileText,
  LayoutTemplate,
  Sparkles,
  Star,
} from 'lucide-react';
import { useAuth } from '../Context/AuthContext';

const trustAvatars = [
  { initials: 'JM', color: 'bg-rose-200 text-rose-800' },
  { initials: 'AK', color: 'bg-sky-200 text-sky-800' },
  { initials: 'SL', color: 'bg-violet-200 text-violet-800' },
  { initials: 'RD', color: 'bg-emerald-200 text-emerald-800' },
  { initials: 'TW', color: 'bg-amber-200 text-amber-900' },
];

function ResumePreview() {
  return (
    <div
      id="resume-preview"
      className="hero-mockup relative mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-slate-900 p-2 shadow-2xl"
    >
      <div className="flex min-h-[390px] overflow-hidden rounded-xl bg-white sm:min-h-[440px]">
        <aside className="hidden w-1/4 shrink-0 border-r border-slate-200 bg-slate-50 p-5 sm:block">
          <div className="mb-8 flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-400 text-slate-900">
              <FileText size={15} />
            </span>
            <span className="text-xs font-bold text-slate-800">Resumbee</span>
          </div>
          {['Dashboard', 'Experience', 'Education', 'Skills'].map((item, index) => (
            <div
              key={item}
              className={`mb-2 rounded-lg px-2.5 py-2 text-[11px] font-medium ${
                index === 0
                  ? 'bg-amber-100 text-slate-900'
                  : 'text-slate-500'
              }`}
            >
              {item}
            </div>
          ))}
        </aside>

        <div className="flex min-w-0 flex-1 bg-slate-100 p-3 sm:p-5">
          <div className="w-1/2 border-r border-slate-200 pr-3 sm:pr-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-[11px] font-bold text-slate-800 sm:text-sm">
                Resume editor
              </h2>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-semibold text-emerald-700">
                Saved
              </span>
            </div>
            <p className="mb-2 text-[9px] font-semibold text-slate-500 sm:text-[10px]">
              PROFESSIONAL SUMMARY
            </p>
            <div className="mb-4 space-y-2 rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3">
              <div className="h-2 w-4/5 rounded bg-slate-200" />
              <div className="h-2 w-full rounded bg-slate-200" />
              <div className="h-2 w-2/3 rounded bg-slate-200" />
            </div>
            <p className="mb-2 text-[9px] font-semibold text-slate-500 sm:text-[10px]">
              WORK EXPERIENCE
            </p>
            <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-2.5 sm:p-3">
              <div className="h-2 w-1/2 rounded bg-amber-300" />
              <div className="h-2 w-full rounded bg-slate-200" />
              <div className="h-2 w-5/6 rounded bg-slate-200" />
            </div>
            <div className="mt-4 flex items-center gap-1.5 rounded-lg bg-amber-50 p-2 text-[9px] font-semibold text-amber-800 sm:text-[10px]">
              <Sparkles size={12} />
              Improve your summary with AI
            </div>
          </div>

          <div className="min-w-0 flex-1 p-3 sm:p-5">
            <div className="mx-auto h-full max-w-[230px] bg-white p-3 shadow-sm sm:p-5">
              <div className="mb-4 border-b-2 border-amber-400 pb-3">
                <p className="text-sm font-extrabold text-slate-800 sm:text-base">
                  Sarah Jenkins
                </p>
                <p className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">
                  Product Manager
                </p>
              </div>
              {['Profile', 'Experience', 'Education'].map((section) => (
                <div key={section} className="mb-4">
                  <h3 className="mb-2 text-[8px] font-bold uppercase tracking-wider text-amber-700 sm:text-[9px]">
                    {section}
                  </h3>
                  <div className="mb-1.5 h-1.5 w-full rounded bg-slate-200" />
                  <div className="mb-1.5 h-1.5 w-5/6 rounded bg-slate-200" />
                  <div className="h-1.5 w-2/3 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Homepage() {
  const root = useRef(null);
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const context = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .fromTo(
          '.hero-copy',
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 },
        )
        .fromTo(
          '.hero-mockup',
          { y: 35, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.8 },
          '-=0.45',
        )
        .fromTo(
          '.hero-callout',
          { y: 12, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.45, stagger: 0.12 },
          '-=0.35',
        );

      gsap.to('.hero-blob', {
        scale: 1.08,
        duration: 6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.5,
      });
      gsap.to('.hero-sparkle', {
        opacity: 0.35,
        scale: 0.75,
        duration: 1.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.2,
      });
      gsap.to('.hero-float', {
        y: -9,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.3,
      });
    }, root);

    return () => context.revert();
  }, []);

  const startBuilding = () => navigate(token ? '/dashboard' : '/register');
  const viewTemplates = () =>
    document.getElementById('resume-preview')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

  return (
    <div
      ref={root}
      className="relative min-h-screen overflow-hidden bg-white text-slate-900"
    >
      <div
        aria-hidden="true"
        className="hero-blob pointer-events-none absolute -left-36 -top-32 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="hero-blob pointer-events-none absolute -bottom-24 -right-32 h-96 w-96 rounded-full bg-yellow-100 blur-3xl"
      />
      <div className="pointer-events-none absolute inset-0 homepage-honeycomb opacity-30" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <a href="#top" className="flex items-center gap-2" aria-label="Resumbee home">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400 text-slate-900 shadow-sm">
            <FileText size={19} />
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            Resum<span className="text-amber-500">bee</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="transition hover:text-slate-950">Features</a>
          <a href="#resume-preview" className="transition hover:text-slate-950">Templates</a>
          <a href="#resume-score" className="transition hover:text-slate-950">Resume Score</a>
          <a href="#get-started" className="transition hover:text-slate-950">Pricing</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4"
          >
            Login
          </button>
          <button
            id="get-started"
            type="button"
            onClick={startBuilding}
            className="rounded-full bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-300 sm:px-5"
          >
            Build for Free
          </button>
        </div>
      </header>

      <main
        id="top"
        className="relative z-[1] mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-24 pt-12 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:px-10 lg:pb-32 lg:pt-16"
      >
        <section id="features" className="relative">
          <p className="hero-copy inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-800">
            <Sparkles size={14} />
            AI-powered resume builder
          </p>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[52px]">
            <span className="hero-copy block">Build a Resume that</span>
            <span className="hero-copy block bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
              Buzzes with Success.
            </span>
          </h1>

          <p className="hero-copy mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            Craft job-winning, ATS-friendly resumes in minutes with AI. Write,
            format, and download with ease.
          </p>

          <div className="hero-copy mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startBuilding}
              className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-200/70 transition hover:-translate-y-0.5 hover:bg-amber-300"
            >
              Create Your Resume
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/60">
                <Sparkles size={12} />
              </span>
            </button>
            <button
              type="button"
              onClick={viewTemplates}
              className="rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              View Templates
            </button>
          </div>

          <p className="hero-copy mt-3 text-sm text-slate-500">
            No credit card required
          </p>

          <div className="hero-copy mt-7 flex flex-wrap items-center gap-3">
            <div className="flex -space-x-2.5" aria-label="Happy job seekers">
              {trustAvatars.map((avatar) => (
                <span
                  key={avatar.initials}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white text-[10px] font-bold shadow-sm ${avatar.color}`}
                >
                  {avatar.initials}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5 text-amber-400" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="text-[13px] font-medium text-slate-700">
                Trusted by 100,000+ job seekers.
              </span>
            </div>
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-2xl" aria-label="Resume builder preview">
          <div className="hero-sparkle absolute -right-1 top-0 z-10 text-amber-400 sm:right-4">
            <Sparkles size={26} />
          </div>
          <div className="hero-float absolute -right-1 top-12 z-10 flex h-24 w-24 flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white shadow-xl sm:-right-5 sm:top-8">
            <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
              ATS score
            </span>
            <div
              id="resume-score"
              className="mt-1 grid h-12 w-12 place-items-center rounded-full border-[5px] border-amber-400 text-xs font-extrabold text-slate-800"
            >
              94%
            </div>
          </div>

          <div className="hero-float absolute -left-1 bottom-8 z-10 hidden items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-3 text-[11px] font-bold text-slate-700 shadow-xl sm:flex sm:-left-6">
            <Sparkles size={15} className="text-amber-500" />
            AI Suggestion: Add a key achievement
          </div>

          <ResumePreview />

          <div className="hero-callout absolute -bottom-7 right-4 z-10 w-48 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:-right-3">
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={16} />
              </span>
              <span className="text-[11px] font-bold text-slate-800">
                Formatting tips
              </span>
            </div>
            <div className="space-y-1.5 text-[10px] text-slate-600">
              <p className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-emerald-500" /> ATS-friendly layout</p>
              <p className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-emerald-500" /> Clear section headings</p>
              <p className="flex items-center gap-1.5"><CheckCircle2 size={11} className="text-emerald-500" /> Consistent formatting</p>
            </div>
          </div>

          <div className="hero-callout absolute -left-2 top-1/3 hidden -translate-x-1/2 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl lg:block">
            <LayoutTemplate size={20} className="text-amber-500" />
            <p className="mt-1 text-[9px] font-bold text-slate-600">Pro templates</p>
          </div>
        </section>
      </main>
    </div>
  );
}
