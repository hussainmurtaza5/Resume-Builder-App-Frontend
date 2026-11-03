import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../Context/AuthContext';
import AuthShell from '../components/AuthShell';

const inputBase =
  'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = Boolean(location.state?.registered);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      );
    }, formRef);

    return () => context.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'We could not sign you in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = () => {
    setNotice('Social sign-in is coming soon — use email and password for now.');
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in and keep your"
      highlight="momentum."
      subtitle="Pick up where you left off. Your drafts, templates and live ATS score are waiting."
    >
      <div ref={formRef}>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Log in</h2>
          <p className="mt-2 text-sm text-slate-500">
            New to Resumbee?{' '}
            <Link to="/register" className="font-semibold text-amber-600 hover:text-amber-500">
              Create an account
            </Link>
          </p>
        </div>

        {justRegistered && (
          <p className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={17} className="shrink-0" />
            Account created. Log in to start building.
          </p>
        )}

        <div className="mt-7 grid gap-3">
          <button
            type="button"
            onClick={handleDemo}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <span className="grid h-5 w-5 place-items-center rounded bg-[#4285F4] text-[11px] font-extrabold text-white">
              G
            </span>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={handleDemo}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <span className="grid h-5 w-5 place-items-center rounded bg-[#0A66C2] text-[11px] font-extrabold text-white">
              in
            </span>
            Continue with LinkedIn
          </button>
        </div>

        {notice && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            {notice}
          </p>
        )}

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            or with email
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Email address
            </label>
            <div className="relative">
              <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className={inputBase}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Password
              </label>
              <button
                type="button"
                onClick={() => setNotice('Password reset links will be emailed once your account is connected.')}
                className="text-xs font-semibold text-amber-600 transition hover:text-amber-500"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={`${inputBase} pr-12`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-amber-400 accent-amber-400"
            />
            Keep me signed in
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-extrabold text-slate-900 shadow-lg shadow-amber-200/70 transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Signing you in…
              </>
            ) : (
              <>
                Log in
                <ArrowRight size={17} />
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <Sparkles size={13} className="text-amber-500" />
            No credit card required to build your first resume
          </p>
        </form>
      </div>
    </AuthShell>
  );
}
