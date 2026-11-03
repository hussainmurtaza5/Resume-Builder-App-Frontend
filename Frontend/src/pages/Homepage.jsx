import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  Check,
  CheckCircle2,
  FileText,
  LayoutTemplate,
  Menu,
  ShieldCheck,
  Sparkles,
  Star,
  WandSparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import { templates } from '../data/templates';

const trustAvatars = [
  { src: '/images/avatar-1.jpg', position: '50% 32%' },
  { src: '/images/avatar-2.jpg', position: '50% 40%' },
  { src: '/images/avatar-3.jpg', position: '50% 30%' },
  { src: '/images/avatar-4.jpg', position: '50% 30%' },
];

const features = [
  {
    title: 'AI bullet writer',
    body: 'Describe the job in one line and get sharp, quantified achievement bullets written for you — in your voice.',
    icon: WandSparkles,
    color: '#F4B41A',
  },
  {
    title: 'Live ATS scoring',
    body: "Every keystroke re-scores your resume against the same rules recruiters' systems use. Watch the number climb.",
    icon: ShieldCheck,
    color: '#10B981',
  },
  {
    title: '120+ recruiter templates',
    body: 'Classic, modern and minimal layouts — all tested to parse cleanly and print beautifully on one page.',
    icon: LayoutTemplate,
    color: '#6366F1',
  },
  {
    title: 'Formatting that just works',
    body: 'Margins, spacing, fonts and section order stay locked to a single-column grid so nothing ever shifts.',
    icon: CheckCircle2,
    color: '#EC4899',
  },
];

const scoreFactors = [
  { id: 'contact', label: 'Contact details are complete', weight: 18, checked: true },
  { id: 'summary', label: 'Has a role-specific summary', weight: 14, checked: true },
  { id: 'verbs', label: 'Bullets start with action verbs', weight: 18, checked: true },
  { id: 'numbers', label: 'Achievements include numbers', weight: 22, checked: true },
  { id: 'skills', label: 'Skills match the job description', weight: 16, checked: true },
  { id: 'format', label: 'Parses cleanly through ATS', weight: 12, checked: false },
];

const plans = [
  {
    name: 'Starter',
    price: 0,
    blurb: 'Everything you need to get a clean resume out the door.',
    features: ['1 resume', '3 templates', 'Live ATS score', 'PDF & DOCX download'],
    cta: 'Build for Free',
  },
  {
    name: 'Bee Pro',
    price: 9,
    blurb: 'For active job seekers running several applications at once.',
    features: [
      'Unlimited resumes',
      'All 120+ templates',
      'AI bullet writer, unlimited',
      'Job tracking board',
      'Cover letter generator',
    ],
    cta: 'Start 7-day trial',
    highlight: true,
  },
  {
    name: 'Team',
    price: 24,
    suffix: '/mo per seat',
    blurb: 'For career coaches, career centres and hiring teams.',
    features: [
      'Everything in Bee Pro',
      'Shared template library',
      'Seat & permission controls',
      'Analytics dashboard',
      'Priority support',
    ],
    cta: 'Talk to us',
  },
];

function ResumePreview({ template }) {
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
            <div className="mb-4 border-b-2 pb-3" style={{ borderColor: template.accent }}>
              <img src={template.photo} alt="" className="mb-2 h-8 w-8 rounded-full object-cover" />
                <p className="text-sm font-extrabold text-slate-800 sm:text-base">
                {template.person}
                </p>
                <p className="mt-1 text-[9px] text-slate-500 sm:text-[10px]">
                {template.role}
                </p>
              </div>
              {['Profile', 'Experience', 'Education'].map((section) => (
                <div key={section} className="mb-4">
                  <h3 className="mb-2 text-[8px] font-bold uppercase tracking-wider sm:text-[9px]" style={{ color: template.accent }}>
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

function SectionHeading({ eyebrow, title, body, light = false, align = 'center' }) {
  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : 'text-left'}`}>
      <p className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${light ? 'border-amber-300/40 bg-amber-300/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl ${light ? 'text-white' : 'text-slate-900'}`}>
        {title}
      </h2>
      {body && <p className={`mt-4 text-base leading-relaxed sm:text-lg ${light ? 'text-slate-300' : 'text-slate-600'}`}>{body}</p>}
    </div>
  );
}

export default function Homepage() {
  const root = useRef(null);
  const navigate = useNavigate();
  const { token } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);
  const [annual, setAnnual] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkedFactors, setCheckedFactors] = useState(() =>
    Object.fromEntries(scoreFactors.map((factor) => [factor.id, factor.checked])),
  );
  const score = scoreFactors.reduce(
    (total, factor) => total + (checkedFactors[factor.id] ? factor.weight : 0),
    0,
  );
  const allFactorsChecked = scoreFactors.every(
    (factor) => checkedFactors[factor.id],
  );

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

  const startBuilding = () =>
    navigate(token ? '/dashboard' : '/register', {
      state: token ? { templateId: selectedTemplate.id } : undefined,
    });
  const viewTemplates = () =>
    document.getElementById('templates')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div
      ref={root}
      className="relative min-h-screen bg-white text-slate-900"
    >
      <div
        aria-hidden="true"
        className="hero-blob pointer-events-none absolute -left-36 -top-32 h-96 w-96 rounded-full bg-amber-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="hero-blob pointer-events-none absolute -bottom-24 -right-32 h-96 w-96 rounded-full bg-yellow-100 blur-3xl"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] homepage-honeycomb opacity-10" />

      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-10">
        <a href="#top" className="flex items-center gap-2" aria-label="Resumbee home">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-50 text-2xl">
            🐝
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            Resum<span className="text-amber-500">bee</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="transition hover:text-slate-950">Features</a>
          <a href="#templates" className="transition hover:text-slate-950">Templates</a>
          <a href="#resume-score" className="transition hover:text-slate-950">Resume Score</a>
          <a href="#pricing" className="transition hover:text-slate-950">Pricing</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="hidden rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex sm:px-4"
          >
            Login
          </button>
          <button
            type="button"
            onClick={startBuilding}
            className="whitespace-nowrap rounded-full bg-amber-400 px-3 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-300 sm:px-5"
          >
            Build for Free
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
            className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-900 md:hidden"
          >
            <Menu size={20} />
          </button>
        </div>
        </div>
      </header>

      <main className="relative z-[1]">
        <section
          id="top"
          className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 pb-24 pt-12 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:px-10 lg:pb-32 lg:pt-16"
        >
        <section className="relative">
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
                <img
                  key={avatar.src}
                  src={avatar.src}
                  alt=""
                  loading="lazy"
                  style={{ objectPosition: avatar.position }}
                  className="h-9 w-9 rounded-full border-2 border-white object-cover shadow-sm"
                />
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
              className="mt-1 grid h-12 w-12 place-items-center rounded-full border-[5px] border-amber-400 text-xs font-extrabold text-slate-800"
            >
              94%
            </div>
          </div>

          <div className="hero-float absolute -left-1 bottom-8 z-10 hidden items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-3 text-[11px] font-bold text-slate-700 shadow-xl sm:flex sm:-left-6">
            <Sparkles size={15} className="text-amber-500" />
            AI Suggestion: Add a key achievement
          </div>

          <ResumePreview template={selectedTemplate} />

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
        </section>

      <section id="features" className="scroll-mt-24 bg-slate-50 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading
            eyebrow="Everything included"
            title="One builder, every reason to get hired"
            body="Write, score, format and export without ever leaving the page. No copy-paste into a word processor, no fighting with margins."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ title, body, icon: Icon, color }) => (
              <article
                key={title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl" style={{ color, backgroundColor: `${color}1a` }}>
                  <Icon size={24} />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="templates" className="scroll-mt-24 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading
            eyebrow="Templates"
            title="Pick a look. Watch it apply live."
            body="Choose a template and the builder preview above updates instantly. Every layout is ATS-safe and prints to a single, crisp page."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => {
              const active = template.id === selectedTemplate.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template)}
                  aria-pressed={active}
                  className={`rounded-2xl border bg-white p-3 text-left transition hover:-translate-y-1 ${active ? 'border-amber-400 shadow-lg shadow-amber-100' : 'border-slate-200 shadow-sm hover:shadow-lg'}`}
                >
                  <div className="relative h-44 overflow-hidden rounded-xl border border-slate-200" style={{ background: template.swatch }}>
                    <div className="absolute inset-x-6 bottom-0 top-7 rounded-t-md bg-white/95 p-3 shadow-sm">
                      <div className="h-2 w-16 rounded-full" style={{ backgroundColor: template.accent }} />
                      <div className="mt-2 h-1.5 w-10 rounded-full bg-slate-200" />
                      <div className="mt-3 space-y-1.5">
                        <div className="h-1.5 w-full rounded-full bg-slate-100" />
                        <div className="h-1.5 w-5/6 rounded-full bg-slate-100" />
                        <div className="h-1.5 w-full rounded-full bg-slate-100" />
                      </div>
                      <div className="mt-3 h-2 w-12 rounded-full" style={{ backgroundColor: template.accent }} />
                      <div className="mt-2 space-y-1.5">
                        <div className="h-1.5 w-full rounded-full bg-slate-100" />
                        <div className="h-1.5 w-4/5 rounded-full bg-slate-100" />
                      </div>
                    </div>
                    {active && <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-amber-400 text-slate-900"><Check size={16} /></span>}
                  </div>
                  <div className="flex items-start justify-between gap-2 px-1.5 pb-1 pt-3.5">
                    <span>
                      <span className="block font-bold text-slate-900">{template.name}</span>
                      <span className="mt-0.5 block text-sm text-slate-500">{template.tagline}</span>
                    </span>
                    {active && <CheckCircle2 size={18} className="mt-1 shrink-0 text-amber-500" />}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-9 text-center">
            <p className="text-sm text-slate-500">Using the <strong className="text-slate-800">{selectedTemplate.name}</strong> template — start with it and make it yours.</p>
            <button type="button" onClick={startBuilding} className="mt-4 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-slate-700">
              Build with {selectedTemplate.name}
            </button>
          </div>
        </div>
      </section>

      <section id="resume-score" className="scroll-mt-24 bg-slate-900 py-20 text-white lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <SectionHeading
              eyebrow="Resume score"
              title="Beat the bots before a human reads it"
              body="Applicant tracking systems quietly discard a third of resumes before a recruiter sees them. Resumbee scores yours live against the same parsing rules — and tells you exactly what to fix."
              light
              align="left"
            />
            <ul className="mt-7 max-w-lg space-y-3">
              {[
                'Checks parsing, structure and keyword coverage',
                'Weights each fix by how often recruiters hit that filter',
                'Recalculates on every keystroke — no refresh needed',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-400 text-slate-900"><Check size={13} /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 sm:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
              <div className="grid h-36 w-36 shrink-0 place-items-center rounded-full p-3" style={{ background: `conic-gradient(#F4B41A ${score}%, rgba(255,255,255,.12) ${score}% 100%)` }}>
                <div className="grid h-full w-full place-content-center rounded-full bg-slate-900 text-center">
                  <span className="text-4xl font-extrabold tabular-nums">{score}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">ATS score</span>
                </div>
              </div>
              <div className="w-full">
                <p className="text-2xl font-extrabold text-emerald-400">{score >= 90 ? 'Excellent' : score >= 75 ? 'Strong' : score >= 60 ? 'Fair' : 'Needs work'}</p>
                <p className="mt-1 text-sm text-slate-300">{score >= 90 ? 'Ready to send.' : 'A few tweaks left.'}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${score}%` }} />
                </div>
                <button
                  type="button"
                  onClick={() => setCheckedFactors(Object.fromEntries(scoreFactors.map((factor) => [factor.id, !allFactorsChecked])))}
                  className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                >
                  Toggle all checks
                </button>
              </div>
            </div>
            <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {scoreFactors.map((factor) => {
                const checked = checkedFactors[factor.id];
                return (
                  <button
                    key={factor.id}
                    type="button"
                    onClick={() => setCheckedFactors((current) => ({ ...current, [factor.id]: !current[factor.id] }))}
                    aria-pressed={checked}
                    className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${checked ? 'border-amber-400/40 bg-amber-400/10' : 'border-white/10 bg-white/[0.03] hover:border-white/25'}`}
                  >
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${checked ? 'border-amber-400 bg-amber-400 text-slate-900' : 'border-white/25 text-transparent'}`}><Check size={13} /></span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-white">{factor.label}</span>
                      <span className="block text-[11px] text-slate-400">+{factor.weight} pts</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <SectionHeading
            eyebrow="Pricing"
            title="Start free. Upgrade when it lands."
            body="No credit card to build your first resume. Cancel any time — your documents stay yours either way."
          />
          <div className="mt-7 flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
              {[{ label: 'Monthly', value: false }, { label: 'Annual · save 20%', value: true }].map((option) => (
                <button key={option.label} type="button" onClick={() => setAnnual(option.value)} className={`rounded-full px-4 py-2 text-xs font-bold transition ${annual === option.value ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl items-stretch gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const price = plan.price === 0 ? 'Free' : `$${annual ? Math.round(plan.price * 0.8) : plan.price}`;
              return (
                <article key={plan.name} className={`relative flex flex-col rounded-2xl border p-7 transition hover:-translate-y-1 ${plan.highlight ? 'border-slate-900 bg-slate-900 text-white shadow-2xl lg:-mt-4' : 'border-slate-200 bg-white shadow-sm'}`}>
                  {plan.highlight && <span className="absolute -top-3 left-7 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-900"><Sparkles size={12} className="mr-1 inline" />Most popular</span>}
                  <h3 className="text-lg font-extrabold">{plan.name}</h3>
                  <p className={`mt-1.5 min-h-10 text-sm ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>{plan.blurb}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-5xl font-extrabold tracking-tight">{price}</span>
                    {plan.price > 0 && <span className={`text-sm ${plan.highlight ? 'text-slate-300' : 'text-slate-500'}`}>{plan.suffix || '/month'}</span>}
                  </div>
                  {annual && plan.price > 0 && <p className="mt-1 text-xs text-amber-600">Billed yearly — you save ${Math.round(plan.price * 12 * 0.2)}</p>}
                  <ul className="mt-7 flex-1 space-y-3">
                    {plan.features.map((item) => <li key={item} className="flex items-start gap-3 text-sm"><span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${plan.highlight ? 'bg-amber-400 text-slate-900' : 'bg-amber-50 text-amber-600'}`}><Check size={12} /></span><span className={plan.highlight ? 'text-slate-100' : 'text-slate-700'}>{item}</span></li>)}
                  </ul>
                  <button type="button" onClick={plan.name === 'Team' ? () => { window.location.href = 'mailto:hello@resumbee.app'; } : startBuilding} className={`mt-8 w-full rounded-full px-6 py-3.5 text-sm font-bold transition ${plan.highlight ? 'bg-amber-400 text-slate-900 hover:bg-amber-300' : 'border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:shadow'}`}>
                    {plan.cta}
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
            <div>
              <a href="#top" className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight" aria-label="Resumbee home">
                <span className="text-2xl">🐝</span><span>Resum<span className="text-amber-500">bee</span></span>
              </a>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-600">The resume builder that writes with you, scores itself, and never breaks a layout. Made for people who would rather get the interview.</p>
              <button type="button" onClick={startBuilding} className="mt-6 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-700">Build for Free</button>
            </div>
            {[
              { title: 'Product', links: [['Features', '#features'], ['Templates', '#templates'], ['Resume Score', '#resume-score'], ['Pricing', '#pricing']] },
              { title: 'Resources', links: [['Resume guide', '#features'], ['ATS explainer', '#resume-score'], ['Help centre', 'mailto:hello@resumbee.app'], ['Contact', 'mailto:hello@resumbee.app']] },
              { title: 'Account', links: [['Login', '/login'], ['Create an account', '/register'], ['Dashboard', '/dashboard']] },
            ].map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900">{column.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map(([label, href]) => (
                    <li key={label}>
                      {href.startsWith('/') ? <button type="button" onClick={() => navigate(href)} className="text-left text-sm text-slate-600 transition hover:text-amber-600">{label}</button> : <a href={href} className="text-sm text-slate-600 transition hover:text-amber-600">{label}</a>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 sm:text-left">
            © {new Date().getFullYear()} Resumbee Labs. All rights reserved.
          </div>
        </div>
      </footer>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button type="button" aria-label="Close menu" onClick={closeMobileMenu} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          <div className="absolute inset-y-0 right-0 flex w-[82%] max-w-sm flex-col bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <a href="#top" onClick={closeMobileMenu} className="text-xl font-extrabold">Resum<span className="text-amber-500">bee</span></a>
              <button type="button" onClick={closeMobileMenu} aria-label="Close menu" className="grid h-10 w-10 place-items-center rounded-full border border-slate-200"><X size={20} /></button>
            </div>
            <nav className="mt-8 flex flex-col gap-1">
              {[['Features', '#features'], ['Templates', '#templates'], ['Resume Score', '#resume-score'], ['Pricing', '#pricing']].map(([label, href]) => <a key={href} href={href} onClick={closeMobileMenu} className="rounded-xl px-4 py-3.5 text-lg font-semibold text-slate-800 transition hover:bg-slate-50">{label}</a>)}
            </nav>
            <div className="mt-auto flex flex-col gap-3">
              <button type="button" onClick={() => { closeMobileMenu(); startBuilding(); }} className="w-full rounded-full bg-amber-400 py-3.5 text-sm font-bold text-slate-900">Build for Free</button>
              <button type="button" onClick={() => { closeMobileMenu(); navigate('/login'); }} className="w-full rounded-full border border-slate-200 py-3.5 text-sm font-bold text-slate-900">Login</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
