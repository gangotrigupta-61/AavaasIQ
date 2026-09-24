'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Building2,
  Shield,
  Briefcase,
  Users,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signupAction } from '@/app/actions/auth';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

type Role = 'resident' | 'admin' | 'security' | 'provider';

interface RoleCard {
  value: Role;
  label: string;
  description: string;
  Icon: React.ElementType;
}

const ROLE_CARDS: RoleCard[] = [
  { value: 'resident', label: 'Resident', description: 'I live in a residential society', Icon: Users },
  { value: 'admin', label: 'Society Admin', description: 'I manage a residential society', Icon: Building2 },
  { value: 'security', label: 'Security', description: 'I handle visitor/security management', Icon: Shield },
  { value: 'provider', label: 'Service Pro', description: 'I provide home services', Icon: Briefcase },
];

const STEP_LABELS = ['Role', 'Details', 'Profile', 'Done'];

const SERVICE_CATEGORIES = [
  'Plumbing', 'Electrical', 'Cleaning', 'AC Service', 'Painting', 'Beauty', 'Other',
];

interface FormData {
  role: Role | null;
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
  // Resident
  societyName: string;
  block: string;
  flatNumber: string;
  // Admin
  numberOfUnits: string;
  // Provider
  serviceCategory: string;
  yearsExperience: string;
}

const INITIAL_FORM: FormData = {
  role: null,
  fullName: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  societyName: '',
  block: '',
  flatNumber: '',
  numberOfUnits: '',
  serviceCategory: '',
  yearsExperience: '',
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0 w-full mb-8">
      {STEP_LABELS.map((label, i) => {
        const idx = i + 1;
        const isDone = idx < step;
        const isActive = idx === step;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  isDone
                    ? 'bg-primary-600 text-white'
                    : isActive
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-900/60'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500'
                )}
              >
                {isDone ? <CheckCircle2 size={16} /> : idx}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block',
                  isActive || isDone ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-500'
                )}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-1 transition-colors',
                  isDone ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-800'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Input helper ─────────────────────────────────────────────────────────────
function Field({
  label, id, ...props
}: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
      <input
        id={id}
        className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
        {...props}
      />
    </div>
  );
}

function SelectField({
  label, id, options, ...props
}: { label: string; id: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
      <select
        id={id}
        className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
        {...props}
      >
        <option value="" className="bg-white dark:bg-[#1a2232] text-neutral-500">Select…</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-100">{o}</option>
        ))}
      </select>
    </div>
  );
}

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [error, setError] = useState('');
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function next() {
    setError('');
    if (step === 1) {
      if (!form.role) { setError('Please select a role to continue.'); return; }
    }
    if (step === 2) {
      if (!form.fullName || !form.mobile || !form.email || !form.password || !form.confirmPassword) {
        setError('Please fill in all fields.'); return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError('Please enter a valid email address.'); return;
      }
      if (!/^\d{10}$/.test(form.mobile)) {
        setError('Mobile number must be exactly 10 digits (numbers only).'); return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.'); return;
      }
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters.'); return;
      }
    }
    if (step === 3) {
      if (form.role === 'resident' && (!form.societyName || !form.block || !form.flatNumber)) {
        setError('Please fill in all fields.'); return;
      }
      if (form.role === 'admin' && (!form.societyName || !form.numberOfUnits)) {
        setError('Please fill in all fields.'); return;
      }
      if (form.role === 'security' && !form.societyName) {
        setError('Please enter society name.'); return;
      }
      if (form.role === 'provider' && (!form.serviceCategory || !form.yearsExperience)) {
        setError('Please fill in all fields.'); return;
      }

      // Step 3 "Create Account" — call real Supabase signup
      const fd = new FormData();
      fd.set('role',         form.role!);
      fd.set('fullName',     form.fullName);
      fd.set('email',        form.email);
      fd.set('password',     form.password);
      fd.set('phone',        `+91${form.mobile}`);
      fd.set('societyName',  form.societyName);
      fd.set('block',        form.block);
      fd.set('flatNumber',   form.flatNumber);

      startTransition(async () => {
        const result = await signupAction(fd);
        if (result?.error) {
          setError(result.error);
          return;
        }
        if (result?.emailConfirmationRequired) {
          setEmailConfirmationSent(true);
        }
        setStep(4);
      });
      return;
    }
    setStep((s) => s + 1);
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0b0f17] flex items-center justify-center p-4 sm:p-8 transition-colors">
      <div className="w-full max-w-lg bg-white dark:bg-[#131924] rounded-2xl border border-neutral-200 dark:border-[#222b3d] shadow-sm p-6 sm:p-8 transition-all">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Building2 className="text-white" size={16} />
              </div>
              <span className="text-neutral-800 dark:text-neutral-100 font-bold text-lg">AavaasIQ</span>
            </div>
            <ThemeToggle />
          </div>
          {step < 4 && (
            <>
              <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100">Create your AavaasIQ account</h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                {step === 1 && 'What best describes you?'}
                {step === 2 && 'Enter your basic details'}
                {step === 3 && 'A few more details to set up your profile'}
              </p>
            </>
          )}
        </div>

        <ProgressBar step={step} />

        {/* Step 1 — Role selection */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {ROLE_CARDS.map(({ value, label, description, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setForm((f) => ({ ...f, role: value })); setError(''); }}
                className={cn(
                  'rounded-xl border-2 p-5 cursor-pointer text-left transition-all duration-150',
                  form.role === value
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40'
                    : 'border-neutral-200 dark:border-[#222b3d] bg-white dark:bg-[#131924] hover:border-neutral-300 dark:hover:border-neutral-700'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center mb-3',
                    form.role === value ? 'bg-primary-100 dark:bg-primary-900/60' : 'bg-neutral-100 dark:bg-neutral-800'
                  )}
                >
                  <Icon
                    size={20}
                    className={form.role === value ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400'}
                  />
                </div>
                <p className={cn('font-semibold text-sm', form.role === value ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-700 dark:text-neutral-200')}>
                  {label}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Step 2 — Basic details */}
        {step === 2 && (
          <div className="space-y-4">
            <Field label="Full Name" id="fullName" type="text" placeholder="e.g. Ramesh Kumar" value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
            <div className="space-y-1.5">
              <label htmlFor="mobile" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Mobile Number</label>
              <div className="flex">
                <span className="flex items-center px-3 rounded-l-lg border border-r-0 border-neutral-200 dark:border-[#2a3547] bg-neutral-50 dark:bg-neutral-800 text-sm text-neutral-500 dark:text-neutral-400 select-none">+91</span>
                <input
                  id="mobile"
                  type="tel"
                  placeholder="9876543210"
                  value={form.mobile}
                  maxLength={10}
                  onChange={(e) => {
                    // Strip non-digits, truncate to 10
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    update('mobile', digits);
                  }}
                  className="flex-1 px-3.5 py-2.5 rounded-r-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                />
              </div>
            </div>
            <Field label="Email Address" id="email" type="email" placeholder="you@email.com" value={form.email} onChange={(e) => update('email', e.target.value)} />
            <Field label="Password" id="password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={(e) => update('password', e.target.value)} />
            <Field label="Confirm Password" id="confirmPassword" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} />
          </div>
        )}

        {/* Step 3 — Role-specific */}
        {step === 3 && (
          <div className="space-y-4">
            {(form.role === 'resident' || form.role === 'admin' || form.role === 'security') && (
              <Field label="Society Name" id="societyName" type="text" placeholder="e.g. Green Valley Residency" value={form.societyName} onChange={(e) => update('societyName', e.target.value)} />
            )}
            {form.role === 'resident' && (
              <>
                <SelectField label="Block" id="block" options={['A', 'B', 'C', 'D']} value={form.block} onChange={(e) => update('block', e.target.value)} />
                <Field label="Flat Number" id="flatNumber" type="text" placeholder="e.g. 302" value={form.flatNumber} onChange={(e) => update('flatNumber', e.target.value)} />
              </>
            )}
            {form.role === 'admin' && (
              <Field label="Number of Units" id="numberOfUnits" type="number" placeholder="e.g. 120" value={form.numberOfUnits} onChange={(e) => update('numberOfUnits', e.target.value)} />
            )}
            {form.role === 'provider' && (
              <>
                <SelectField label="Service Category" id="serviceCategory" options={SERVICE_CATEGORIES} value={form.serviceCategory} onChange={(e) => update('serviceCategory', e.target.value)} />
                <Field label="Years of Experience" id="yearsExperience" type="number" placeholder="e.g. 5" value={form.yearsExperience} onChange={(e) => update('yearsExperience', e.target.value)} />
              </>
            )}
          </div>
        )}

        {/* Step 4 — Success */}
        {step === 4 && (
          <div className="text-center py-6 space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="text-green-600 dark:text-green-400" size={64} strokeWidth={1.5} />
            </div>
            {emailConfirmationSent ? (
              <>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Check Your Email!</h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  We sent a confirmation link to{' '}
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">{form.email}</span>.
                  Click the link to activate your account, then sign in.
                </p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition"
                >
                  Go to Sign In <ChevronRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Account Created!</h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                  Welcome to AavaasIQ,{' '}
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">{form.fullName || 'there'}</span>!
                  Your account is ready.
                </p>
                <Link
                  href="/login"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition"
                >
                  Sign In to Dashboard <ChevronRight size={16} />
                </Link>
              </>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Navigation buttons */}
        {step < 4 && (
          <div className="mt-6 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button
                type="button"
                disabled={isPending}
                onClick={() => { setStep((s) => s - 1); setError(''); }}
                className="px-5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-300 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50 cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div className="flex flex-col gap-1">
                <Link href="/" className="text-xs text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
                  ← Back to Home
                </Link>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Have an account?{' '}
                  <Link href="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline focus:underline">
                    Sign in
                  </Link>
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={next}
              disabled={isPending}
              className="px-6 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating Account…
                </>
              ) : (
                <>{step === 3 ? 'Create Account' : 'Continue'} <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
