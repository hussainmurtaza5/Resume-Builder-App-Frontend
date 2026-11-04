import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  FileText,
  LayoutTemplate,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  WandSparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import {
  analyzeApplication,
  apiFetch,
  createApplication,
  deleteApplication,
  duplicateResume,
  exportResumeFile,
  exportResumeJson,
  getApplication,
  getApplications,
  getResumes,
  tailorResume,
  updateApplication,
} from '../api';
import ResumeForm from '../components/ResumeForm';
import ResumePreview from '../components/ResumePreview';
import Logo from '../components/Logo';
import { TemplateGrid } from '../components/TemplatePicker';
import { getResumePreferences } from '../lib/prefs';
import { computeAtsScore } from '../lib/ats';
import { getTemplate } from '../data/templates';

function safeExternalUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

export default function Dashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingResume, setEditingResume] = useState(null);
  const [deletingResumeIds, setDeletingResumeIds] = useState(() => new Set());
  const [busyResumeIds, setBusyResumeIds] = useState(() => new Set());
  const [tailorOpen, setTailorOpen] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [tailorResult, setTailorResult] = useState(null);
  const [tailorLoading, setTailorLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationError, setApplicationError] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [applicationOpen, setApplicationOpen] = useState(null);
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationSaving, setApplicationSaving] = useState(false);
  const [applicationForm, setApplicationForm] = useState({ company: '', role: '', job_url: '', notes: '' });
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await getResumes(token);
        setResumes(data || []);
        setLoadError('');
      } catch (err) {
        console.error(err);
        setLoadError(
          err.message || 'We could not reach the server. Your resumes will load once the connection is back.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
  }, [token]);

  useEffect(() => {
    let active = true;
    getApplications(token)
      .then((data) => {
        if (!active) return;
        setApplications(data || []);
        setApplicationError('');
      })
      .catch((err) => {
        if (active) setApplicationError(err.message || 'Applications could not be loaded.');
      })
      .finally(() => {
        if (active) setApplicationsLoading(false);
      });
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const stats = useMemo(() => {
    const scores = resumes.map((resume) => computeAtsScore(resume).score);
    const average = scores.length
      ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
      : 0;
    const interviewCount = applications.filter((application) => application.status === 'interviewing').length;
    return [
      { label: 'Resumes', value: resumes.length, icon: FileText, tint: 'text-amber-600 bg-amber-50' },
      { label: 'Average ATS score', value: average, icon: ShieldCheck, tint: 'text-emerald-600 bg-emerald-50' },
      { label: 'Templates ready', value: 120, icon: LayoutTemplate, tint: 'text-indigo-600 bg-indigo-50' },
      { label: 'Interviews', value: interviewCount, icon: Sparkles, tint: 'text-pink-600 bg-pink-50' },
    ];
  }, [resumes, applications]);

  const openBuilder = (templateId = null) => {
    setSelectedTemplateId(templateId);
    setEditingResume(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // A template picked on the homepage lands here through router state
  const [routerState, setRouterState] = useState(location.state);
  if (location.state !== routerState) {
    setRouterState(location.state);
    if (location.state?.templateId) {
      setSelectedTemplateId(location.state.templateId);
      setEditingResume(null);
      setShowForm(true);
    }
  }

  useEffect(() => {
    if (!location.state?.templateId) return;
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.state, location.pathname, navigate]);

  const openEditor = (resume) => {
    setEditingResume(resume);
    setSelectedTemplateId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResumeCreated = (savedResume) => {
    setResumes((current) =>
      editingResume
        ? current.map((resume) => (resume.id === savedResume.id ? savedResume : resume))
        : [savedResume, ...current],
    );
    setEditingResume(null);
    setShowForm(false);
  };

  const handleDelete = async (resumeId) => {
    if (deletingResumeIds.has(resumeId)) return;
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    setDeletingResumeIds((current) => new Set(current).add(resumeId));
    try {
      await apiFetch(`/resumes/${resumeId}`, { method: 'DELETE' }, token);
      setResumes((current) => current.filter((resume) => resume.id !== resumeId));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingResumeIds((current) => {
        const updated = new Set(current);
        updated.delete(resumeId);
        return updated;
      });
    }
  };

  const markBusy = (resumeId, busy) =>
    setBusyResumeIds((current) => {
      const next = new Set(current);
      if (busy) next.add(resumeId);
      else next.delete(resumeId);
      return next;
    });

  const handleDuplicate = async (resume) => {
    markBusy(resume.id, true);
    try {
      const copy = await duplicateResume(resume.id, {}, token);
      setResumes((current) => [copy, ...current]);
    } catch (err) {
      alert(err.message);
    } finally {
      markBusy(resume.id, false);
    }
  };

  const handleExport = async (resume) => {
    markBusy(resume.id, true);
    try {
      const data = await exportResumeJson(resume.id, token);
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(resume.full_name || 'resume').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    } finally {
      markBusy(resume.id, false);
    }
  };

  const handleExportFile = async (resume, format) => {
    markBusy(resume.id, true);
    try {
      const blob = await exportResumeFile(resume.id, format, token);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const extension = format === 'pdf' ? 'pdf' : 'docx';
      link.href = url;
      link.download = `${(resume.title || resume.full_name || 'resume').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message);
    } finally {
      markBusy(resume.id, false);
    }
  };

  const handleTailor = async () => {
    if (jobDescription.trim().length < 20) {
      alert('Please enter at least 20 characters of job description.');
      return;
    }
    setTailorLoading(true);
    try {
      setTailorResult(await tailorResume({ resume_id: tailorOpen.id, job_description: jobDescription }, token));
    } catch (err) {
      alert(err.message);
    } finally {
      setTailorLoading(false);
    }
  };

  const openTailor = (resume) => {
    setTailorOpen(resume);
    setTailorResult(null);
    setJobDescription('');
    setApplicationForm({ company: '', role: '', job_url: '', notes: '' });
  };

  const handleSaveApplication = async () => {
    if (!applicationForm.company.trim() || !applicationForm.role.trim()) {
      alert('Add the company and role before saving this application.');
      return;
    }
    if (jobDescription.trim().length < 20) {
      alert('Please enter at least 20 characters of job description.');
      return;
    }
    setApplicationSaving(true);
    try {
      const saved = await createApplication({
        resume_id: tailorOpen.id,
        company: applicationForm.company.trim(),
        role: applicationForm.role.trim(),
        job_url: applicationForm.job_url.trim() || null,
        job_description: jobDescription.trim(),
        notes: applicationForm.notes.trim(),
      }, token);
      setApplications((current) => [saved, ...current]);
      setTailorOpen(null);
      setApplicationOpen(saved);
      document.getElementById('applications')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert(err.message);
    } finally {
      setApplicationSaving(false);
    }
  };

  const openApplication = async (application) => {
    setApplicationLoading(true);
    try {
      setApplicationOpen(await getApplication(application.id, token));
    } catch (err) {
      alert(err.message);
    } finally {
      setApplicationLoading(false);
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      const updated = await updateApplication(applicationId, { status }, token);
      setApplications((current) => current.map((item) => item.id === updated.id ? updated : item));
      setApplicationOpen(updated);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAnalyzeApplication = async (applicationId) => {
    setApplicationLoading(true);
    try {
      const updated = await analyzeApplication(applicationId, token);
      setApplications((current) => current.map((item) => item.id === updated.id ? updated : item));
      setApplicationOpen(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setApplicationLoading(false);
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (!window.confirm('Delete this application and its saved tailored resume?')) return;
    try {
      await deleteApplication(applicationId, token);
      setApplications((current) => current.filter((item) => item.id !== applicationId));
      setApplicationOpen(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const visibleApplications = applicationFilter === 'all'
    ? applications
    : applications.filter((application) => application.status === applicationFilter);

  const handleLogout = () => {
    logout();
    navigate('/homepage');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5 lg:px-10">
          <div className="flex items-center gap-8">
            <Logo to="/homepage" />
            <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-500 md:flex">
              <span className="text-slate-900">Dashboard</span>
              <a href="#templates" className="transition hover:text-slate-900">
                Templates
              </a>
              <a href="#resumes" className="transition hover:text-slate-900">
                My resumes
              </a>
              <a href="#applications" className="transition hover:text-slate-900">
                Applications
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => openBuilder()}
              className="whitespace-nowrap rounded-full bg-amber-400 px-3 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-300 sm:px-5"
            >
              <span className="inline-flex items-center gap-1.5">
                <Plus size={16} />
                <span className="hidden sm:inline">New resume</span>
                <span className="sm:hidden">New</span>
              </span>
            </button>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-slate-300"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-sm font-extrabold text-amber-700">
                  {(resumes[0]?.full_name || 'R').trim().charAt(0).toUpperCase()}
                </span>
                <ChevronDown size={15} className="text-slate-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {resumes[0]?.full_name || 'Your workspace'}
                    </p>
                    <p className="truncate text-xs text-slate-500">{resumes[0]?.email || 'Signed in'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/homepage');
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ArrowRight size={15} /> Back to website
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={15} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-10">
        {showForm ? (
          <div>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingResume(null);
              }}
              className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-slate-900"
            >
              ← Back to dashboard
            </button>
            <ResumeForm
              onResumeCreated={handleResumeCreated}
              onCancel={() => {
                setEditingResume(null);
                setShowForm(false);
              }}
              initialData={editingResume}
              initialTemplateId={selectedTemplateId}
            />
          </div>
        ) : (
          <>
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-12">
              <div className="pointer-events-none absolute inset-0 homepage-honeycomb opacity-[0.12]" />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-amber-400/25 blur-3xl"
              />
              <div className="relative z-1 flex flex-wrap items-end justify-between gap-8">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-300">
                    <Sparkles size={13} /> Your workspace
                  </span>
                  <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Welcome back 👋
                  </h1>
                  <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                    Pick a template, write your story and watch the preview update live. Your
                    resume is always ATS-ready.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openBuilder()}
                      className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:-translate-y-0.5 hover:bg-amber-300"
                    >
                      <Plus size={16} /> Create a resume
                    </button>
                    <a
                      href="#templates"
                      className="rounded-full border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                    >
                      Browse templates
                    </a>
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-4 lg:gap-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur"
                    >
                      <span className={`grid h-9 w-9 place-items-center rounded-xl ${stat.tint}`}>
                        <stat.icon size={17} />
                      </span>
                      <p className="mt-3 text-2xl font-extrabold tabular-nums">{stat.value}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Templates */}
            <section id="templates" className="mt-14 scroll-mt-24">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
                    Templates
                  </span>
                  <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    Start from a template
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    Every layout is ATS-safe, prints on a single page and can be restyled with the
                    font picker inside the builder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openBuilder()}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Start from scratch
                  <ArrowRight size={15} />
                </button>
              </div>

              <div className="mt-8">
                <TemplateGrid
                  selectedId={null}
                  onSelect={(template) => openBuilder(template.id)}
                  columns="sm:grid-cols-2 lg:grid-cols-3"
                />
              </div>
            </section>

            {/* Resumes */}
            <section id="resumes" className="mt-16 scroll-mt-24">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
                    My resumes
                  </span>
                  <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    Your documents
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => openBuilder()}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                  <Plus size={15} /> New resume
                </button>
              </div>

              <div className="mt-8">
                {loadError && (
                  <p className="mb-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                    <ShieldCheck size={17} className="mt-0.5 shrink-0" />
                    {loadError}
                  </p>
                )}
                {loading ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
                    <Loader2 size={18} className="animate-spin text-amber-500" />
                    Loading your resumes…
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-500">
                      <FileText size={26} />
                    </span>
                    <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                      You haven't created any resumes yet
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                      Choose a template above and your live preview will build itself as you type.
                    </p>
                    <button
                      type="button"
                      onClick={() => openBuilder()}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-900 transition hover:-translate-y-0.5 hover:bg-amber-300"
                    >
                      <Plus size={16} /> Create your first resume
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-5 lg:grid-cols-2">
                    {resumes.map((resume) => (
                      <ResumeCard
                        key={resume.id}
                        resume={resume}
                        busy={busyResumeIds.has(resume.id)}
                        deleting={deletingResumeIds.has(resume.id)}
                        onEdit={() => openEditor(resume)}
                        onDuplicate={() => handleDuplicate(resume)}
                        onExport={() => handleExport(resume)}
                        onExportPdf={() => handleExportFile(resume, 'pdf')}
                        onExportWord={() => handleExportFile(resume, 'word')}
                        onTailor={() => openTailor(resume)}
                        onDelete={() => handleDelete(resume.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Applications */}
            <section id="applications" className="mt-16 scroll-mt-24">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-indigo-700">
                    <BriefcaseBusiness size={13} /> Job search
                  </span>
                  <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    Application tracker
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    Keep every opportunity, status update and saved tailored resume together.
                  </p>
                </div>
                <select
                  value={applicationFilter}
                  onChange={(event) => setApplicationFilter(event.target.value)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-amber-400"
                >
                  <option value="all">All applications</option>
                  <option value="wishlist">Wishlist</option>
                  <option value="applied">Applied</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offer">Offers</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>

              <div className="mt-8">
                {applicationError && (
                  <p className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                    {applicationError}
                  </p>
                )}
                {applicationsLoading ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
                    <Loader2 size={18} className="animate-spin text-amber-500" /> Loading applications…
                  </div>
                ) : visibleApplications.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
                    <BriefcaseBusiness className="mx-auto text-indigo-400" size={28} />
                    <h3 className="mt-4 text-lg font-extrabold text-slate-900">No applications here yet</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                      Open Tailor on a resume, add the job details and save it as an application.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {visibleApplications.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        onOpen={() => openApplication(application)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      {tailorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setTailorOpen(null)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  Tailor “{tailorOpen.full_name}”
                </h2>
                <p className="text-xs text-slate-500">
                  Add the role details, then save a tailored copy for this application.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTailorOpen(null)}
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={applicationForm.company}
                  onChange={(event) => setApplicationForm((current) => ({ ...current, company: event.target.value }))}
                  placeholder="Company name"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                />
                <input
                  value={applicationForm.role}
                  onChange={(event) => setApplicationForm((current) => ({ ...current, role: event.target.value }))}
                  placeholder="Target role"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                />
              </div>
              <input
                value={applicationForm.job_url}
                onChange={(event) => setApplicationForm((current) => ({ ...current, job_url: event.target.value }))}
                placeholder="Job posting URL (optional)"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                placeholder="Paste the job description here…"
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-relaxed shadow-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />
              <textarea
                value={applicationForm.notes}
                onChange={(event) => setApplicationForm((current) => ({ ...current, notes: event.target.value }))}
                rows={2}
                placeholder="Notes (optional)"
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-relaxed outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
              />

              {tailorResult && (
                <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center gap-4">
                    <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-xl font-extrabold text-emerald-600">
                      {tailorResult.match_score}%
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">Match score</p>
                      <p className="text-xs text-slate-500">How well this resume fits the role.</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                        Matched skills
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {tailorResult.matched_skills.join(', ') || 'None yet'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                        Missing skills
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {tailorResult.missing_skills.join(', ') || 'None — nice work'}
                      </p>
                    </div>
                  </div>
                  {tailorResult.recommendations?.length > 0 && (
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Recommendations
                      </p>
                      <ul className="mt-1 space-y-1 text-sm text-slate-700">
                        {tailorResult.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-amber-500" />
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setTailorOpen(null)}
                className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleTailor}
                disabled={tailorLoading}
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-2.5 text-sm font-extrabold text-slate-900 transition hover:bg-amber-300 disabled:opacity-60"
              >
                {tailorLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <WandSparkles size={15} />
                )}
                {tailorLoading ? 'Analyzing…' : 'Analyze match'}
              </button>
              <button
                type="button"
                onClick={handleSaveApplication}
                disabled={applicationSaving}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-slate-700 disabled:opacity-60"
              >
                {applicationSaving ? <Loader2 size={15} className="animate-spin" /> : <BriefcaseBusiness size={15} />}
                {applicationSaving ? 'Saving…' : 'Save application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {applicationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <button type="button" aria-label="Close" onClick={() => setApplicationOpen(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-indigo-600">Saved application</p>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">{applicationOpen.role} · {applicationOpen.company}</h2>
                <p className="mt-1 text-xs text-slate-500">Tailored resume saved with this application.</p>
              </div>
              <button type="button" onClick={() => setApplicationOpen(null)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"><X size={17} /></button>
            </div>
            <div className="space-y-5 px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-xs font-bold text-slate-500">Status
                  <select value={applicationOpen.status} onChange={(event) => handleApplicationStatus(applicationOpen.id, event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-amber-400">
                    <option value="wishlist">Wishlist</option><option value="applied">Applied</option><option value="interviewing">Interviewing</option><option value="offer">Offer</option><option value="rejected">Rejected</option><option value="withdrawn">Withdrawn</option>
                  </select>
                </label>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Match score</p><p className="mt-1 text-2xl font-extrabold text-slate-900">{applicationOpen.match_score == null ? '—' : `${applicationOpen.match_score}%`}</p></div>
                {safeExternalUrl(applicationOpen.job_url) ? <a href={safeExternalUrl(applicationOpen.job_url)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"><ExternalLink size={15} /> Job posting</a> : <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">No job URL added</div>}
              </div>
              {applicationOpen.analysis && <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Analysis</p><p className="mt-2 text-sm text-slate-700">{applicationOpen.analysis.strengths?.join(' · ') || 'Analysis complete.'}</p>{applicationOpen.analysis.recommendations?.length > 0 && <ul className="mt-3 space-y-1 text-sm text-slate-600">{applicationOpen.analysis.recommendations.map((item, index) => <li key={index}>• {item}</li>)}</ul>}</div>}
              <div className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => handleDeleteApplication(applicationOpen.id)} className="rounded-full border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50">Delete application</button>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => handleAnalyzeApplication(applicationOpen.id)} disabled={applicationLoading} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-700 disabled:opacity-60">{applicationLoading ? <Loader2 size={15} className="animate-spin" /> : <WandSparkles size={15} />} Analyze</button>
                  <button type="button" onClick={() => { setApplicationOpen(null); openEditor(applicationOpen.tailored_resume); }} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700"><Pencil size={15} /> Edit saved resume</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationCard({ application, onOpen }) {
  const statusStyles = {
    wishlist: 'bg-slate-100 text-slate-600',
    applied: 'bg-blue-50 text-blue-700',
    interviewing: 'bg-amber-50 text-amber-700',
    offer: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-600',
    withdrawn: 'bg-slate-100 text-slate-500',
  };
  return (
    <button type="button" onClick={onOpen} className="group text-left rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold text-slate-900">{application.role}</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-500">{application.company}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${statusStyles[application.status] || statusStyles.wishlist}`}>{application.status}</span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>{application.match_score == null ? 'Not analyzed' : `${application.match_score}% match`}</span>
        <span className="inline-flex items-center gap-1 font-bold text-indigo-600 group-hover:text-indigo-800">Open details <ArrowRight size={13} /></span>
      </div>
    </button>
  );
}

function ResumeCard({ resume, busy, deleting, onEdit, onDuplicate, onExport, onExportPdf, onExportWord, onTailor, onDelete }) {
  const prefs = getResumePreferences(resume.id);
  const template = getTemplate(prefs.templateId);
  const { score, rating } = computeAtsScore(resume);
  const experiences = resume.experiences?.length || 0;
  const skills = resume.skills?.length || 0;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex gap-5 p-5">
        <div className="hidden shrink-0 overflow-hidden rounded-xl border border-slate-200 sm:block">
          <ResumePreview
            data={resume}
            templateId={prefs.templateId}
            fontId={prefs.fontId}
            scale={0.19}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-extrabold text-slate-900">
                {resume.full_name || 'Untitled resume'}
              </h3>
              <p className="truncate text-sm text-slate-500">{resume.email}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                score >= 75
                  ? 'bg-emerald-50 text-emerald-600'
                  : score >= 60
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-600'
              }`}
            >
              ATS {score} · {rating}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {template.name}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {prefs.fontId}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {experiences} role{experiences === 1 ? '' : 's'}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {skills} skill{skills === 1 ? '' : 's'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
            >
              <Pencil size={13} /> Edit
            </button>
            <button
              type="button"
              onClick={onTailor}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
            >
              <WandSparkles size={13} /> Tailor
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <Copy size={13} /> Duplicate
            </button>
            <button
              type="button"
              onClick={onExport}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              <Download size={13} /> Export JSON
            </button>
            <button
              type="button"
              onClick={onExportPdf}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3.5 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            >
              <Download size={13} /> PDF
            </button>
            <button
              type="button"
              onClick={onExportWord}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 px-3.5 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
            >
              <Download size={13} /> Word
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
