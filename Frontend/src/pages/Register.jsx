import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowRight, Check, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { registerUser } from '../api';
import AuthShell from '../components/AuthShell';

const inputBase =
  'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100';

const rules = [
  { id: 'length', label: 'At least 8 characters', test: (value) => value.length >= 8 },
  { id: 'case', label: 'One uppercase letter', test: (value) => /[A-Z]/.test(value) },
  { id: 'number', label: 'One number', test: (value) => /\d/.test(value) },
];

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);
  const navigate = useNavigate();

  const strength = useMemo(() => {
    const passed = rules.filter((rule) => rule.test(password)).length;
    const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-slate-200', 'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-emerald-500'];
    return {
      passed,
      label: labels[passed],
      color: colors[passed],
      width: `${(passed / rules.length) * 100}%`,
    };
  }, [password]);

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

    if (password !== confirm) {
      setError('Those passwords do not match.');
      return;
    }
    if (!agreed) {
      setError('Please accept the terms to create your account.');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({ email: email.trim(), password });
      navigate('/login', { state: { registered: true, email: email.trim() } });
    } catch (err) {
      setError(err.message || 'We could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = () => {
    setError('Social sign-up is coming soon — use email and password for now.');
  };

  return (
    <AuthShell
      eyebrow="Get started free"
      title="Your next job starts with a"
      highlight="better resume."
      subtitle="Create an account, pick a template and watch your live preview update as you type."
    >
      <div ref={formRef}>
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Create account</h2>
          <p className="mt-2 text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-500">
              Log in
            </Link>
          </p>
        </div>

        <div className="mt-7 grid gap-3">
          <button
            type="button"
            onClick={handleDemo}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <span className="grid h-5 w-5 place-items-center rounded bg-[#4285F4] text-[11px] font-extrabold text-white">
              G
            </span>
            Sign up with Google
          </button>
          <button
            type="button"
            onClick={handleDemo}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <span className="grid h-5 w-5 place-items-center rounded bg-[#0A66C2] text-[11px] font-extrabold text-white">
              in
            </span>
            Sign up with LinkedIn
          </button>
        </div>

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
            <label htmlFor="password" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <div className="relative">
              <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputBase}
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

            {password && (
              <div className="mt-2.5">
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                    style={{ width: strength.width }}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {strength.label}
                  </span>
                  {rules.map((rule) => (
                    <span
                      key={rule.id}
                      className={`flex items-center gap-1 text-[11px] font-medium ${
                        rule.test(password) ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      <Check size={12} />
                      {rule.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Confirm password
            </label>
            <div className="relative">
              <ShieldCheck size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                required
                autoComplete="new-password"
                className={inputBase}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {confirm && password !== confirm && (
              <p className="mt-1.5 text-xs font-medium text-red-500">Passwords do not match yet.</p>
            )}
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-amber-400"
            />
            <span>
              I agree to the{' '}
              <span className="font-semibold text-slate-800 underline decoration-amber-400 decoration-2 underline-offset-2">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="font-semibold text-slate-800 underline decoration-amber-400 decoration-2 underline-offset-2">
                Privacy Policy
              </span>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-sm font-extrabold text-slate-900 shadow-lg shadow-amber-200/70 transition hover:-translate-y-0.5 hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {submitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Creating your account…
              </>
            ) : (
              <>
                Create free account
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
