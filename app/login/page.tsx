'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Home,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { loginAction } from '@/app/actions/auth';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

type Role = 'resident' | 'admin' | 'security' | 'provider';

interface RoleConfig {
  value: Role;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ElementType;
  demoEmail: string;
  demoPassword: string;
  demoName: string;
  destination: string;
  portalName: string;
  description: string;
}

const ROLES: RoleConfig[] = [
  {
    value: 'resident',
    title: 'Resident',
    subtitle: 'Flat Owner / Tenant',
    badge: 'Flat A-204',
    icon: Home,
    demoEmail: 'rahul.sharma@email.com',
    demoPassword: 'residentPass123',
    demoName: 'Rahul Sharma',
    destination: '/resident/dashboard',
    portalName: 'Resident Portal',
    description: 'Track visitor arrivals, pay maintenance bills, raise complaints & RSVP to events.',
  },
  {
    value: 'admin',
    title: 'Society Admin',
    subtitle: 'Committee Member',
    badge: 'RWA Office',
    icon: ShieldCheck,
    demoEmail: 'admin@greenvalley.in',
    demoPassword: 'adminPass123',
    demoName: 'Secretary Office',
    destination: '/admin/dashboard',
    portalName: 'Admin Operations',
    description: 'Oversee resident directories, track society finances, publish notices & manage vendors.',
  },
  {
    value: 'security',
    title: 'Security Guard',
    subtitle: 'Gate & Patrol Desk',
    badge: 'Main Gate 1',
    icon: ShieldAlert,
    demoEmail: 'gate1@greenvalley.in',
    demoPassword: 'guardPass123',
    demoName: 'Main Gate Team',
    destination: '/security/dashboard',
    portalName: 'Security Console',
    description: 'Log guest vehicles, verify deliveries, scan visitor passes & trigger emergency alerts.',
  },
  {
    value: 'provider',
    title: 'Service Partner',
    subtitle: 'Verified Technician',
    badge: 'Plumbing & Repairs',
    icon: Wrench,
    demoEmail: 'ramesh.kumar@email.com',
    demoPassword: 'proPass123',
    demoName: 'Ramesh Kumar',
    destination: '/provider/dashboard',
    portalName: 'Provider Desk',
    description: 'Accept resident service orders, manage scheduled visits & review weekly earnings.',
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role>('resident');
  const [identifier, setIdentifier] = useState('rahul.sharma@email.com');
  const [password, setPassword] = useState('residentPass123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const activeRoleConfig = ROLES.find((r) => r.value === selectedRole) || ROLES[0];

  function handleSelectRole(role: Role) {
    setSelectedRole(role);
    const config = ROLES.find((r) => r.value === role);
    if (config) {
      setIdentifier(config.demoEmail);
      setPassword(config.demoPassword);
    }
  }

  function handleQuickDemoFill(role: Role) {
    setSelectedRole(role);
    const config = ROLES.find((r) => r.value === role);
    if (config) {
      setIdentifier(config.demoEmail);
      setPassword(config.demoPassword);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both email/mobile and password.');
      return;
    }
    const formData = new FormData();
    formData.set('email', identifier.trim());
    formData.set('password', password);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel — desktop only */}
      <aside className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Building2 className="text-white" size={22} />
          </div>
          <span className="text-white text-2xl font-bold tracking-tight">AavaasIQ</span>
        </Link>

        {/* Hero text */}
        <div className="space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-primary-100 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Role-Based Smart Access
          </div>
          <h1 className="text-3xl font-extrabold text-white leading-snug">
            One platform.<br />
            Tailored consoles for everyone.
          </h1>
          <p className="text-primary-100 text-sm sm:text-base leading-relaxed max-w-sm">
            Select your community role to enter your dedicated management portal with zero clutter.
          </p>

          <div className="pt-4 space-y-3 text-xs text-primary-100/90">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span>Resident, Admin, Security, and Pro permissions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span>Encrypted credentials with instant session recovery</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span>One-click interactive demo accounts for instant testing</span>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <blockquote className="border-l-2 border-white/30 pl-4 relative z-10">
          <p className="text-primary-100 text-xs italic leading-relaxed">
            &ldquo;Managing our 450-apartment township became effortless once committee, gate guards, and residents all synced on AavaasIQ.&rdquo;
          </p>
          <footer className="mt-2 text-white text-xs font-semibold">
            — Kavitha Menon, Secretary, Green Valley Residency
          </footer>
        </blockquote>
      </aside>

      {/* Right form panel */}
      <main className="flex-1 flex items-center justify-center bg-neutral-50 dark:bg-[#0b0f17] p-4 sm:p-8 lg:p-12 overflow-y-auto transition-colors">
        <div className="w-full max-w-xl space-y-6 my-auto">
          {/* Header row with logo / back link / ThemeToggle */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2 lg:hidden">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <Building2 className="text-white" size={16} />
                </div>
                <span className="text-neutral-900 dark:text-neutral-100 text-lg font-bold">AavaasIQ</span>
              </Link>
            </div>
            <Link href="/" className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200">
              ← Back to Home
            </Link>
            <ThemeToggle />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              Select your role below to access your customized dashboard.
            </p>
          </div>

          {/* Interactive Role Cards (2x2 Grid) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
              Step 1: Choose Your Role
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ROLES.map((role) => {
                const IconComponent = role.icon;
                const isSelected = selectedRole === role.value;
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleSelectRole(role.value)}
                    className={cn(
                      'relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer group',
                      isSelected
                        ? 'border-primary-600 bg-white dark:bg-[#131924] ring-2 ring-primary-600/20 shadow-sm'
                        : 'border-neutral-200 dark:border-[#222b3d] bg-white dark:bg-[#131924] hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50/80 dark:hover:bg-[#182130]'
                    )}
                  >
                    {/* Active check badge */}
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary-600 text-white flex items-center justify-center">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}

                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-colors',
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700'
                      )}
                    >
                      <IconComponent size={16} />
                    </div>

                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm leading-tight">
                      {role.title}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug line-clamp-1">
                      {role.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Role Context & Destination Preview Banner */}
          <div className="p-3.5 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200/80 dark:border-primary-900/60 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 flex items-center justify-center shrink-0 mt-0.5">
              <activeRoleConfig.icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-primary-900 dark:text-primary-200 flex items-center gap-1.5">
                  <span>Selected: {activeRoleConfig.title}</span>
                  <span className="text-[10px] bg-primary-200/70 dark:bg-primary-900/80 text-primary-800 dark:text-primary-200 px-1.5 py-0.2 rounded font-medium">
                    {activeRoleConfig.badge}
                  </span>
                </p>
                <span className="text-[11px] text-primary-700 dark:text-primary-400 font-medium">
                  → {activeRoleConfig.portalName}
                </span>
              </div>
              <p className="text-xs text-primary-800/80 dark:text-primary-300/80 mt-0.5 leading-relaxed">
                {activeRoleConfig.description}
              </p>
            </div>
          </div>

          {/* Quick Demo One-Click Selectors */}
          <div className="bg-white dark:bg-[#131924] rounded-xl p-3 border border-neutral-200/90 dark:border-[#222b3d] shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                Quick Demo Fill:
              </span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500">Click to autofill credentials</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => handleQuickDemoFill(r.value)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                    selectedRole === r.value
                      ? 'bg-primary-600 text-white shadow-2xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  )}
                >
                  {r.demoName} ({r.title})
                </button>
              ))}
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-[#131924] p-5 rounded-2xl border border-neutral-200 dark:border-[#222b3d] shadow-sm">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Step 2: Sign In Credentials
              </label>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">Ready to test</span>
            </div>

            {/* Identifier */}
            <div className="space-y-1">
              <label htmlFor="identifier" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={16} />
                <input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="e.g. 9876543210 or user@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" size={16} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 active:bg-primary-800 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Entering {activeRoleConfig.portalName}…
                </>
              ) : (
                <>
                  <span>Sign In to {activeRoleConfig.portalName}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="text-center text-xs text-neutral-500 dark:text-neutral-400 pt-1">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Create a new society account →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
