'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Save, Sun, Moon, Laptop, UserCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/components/theme/ThemeProvider';
import { cn } from '@/lib/utils';
import { getCurrentUserProfile, updateUserProfile, type UserProfileData } from '@/app/actions/profile';

export default function SecuritySettingsPage() {
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingTerminal, setSavingTerminal] = useState(false);

  // Authenticated Security Profile State
  const [securityProfile, setSecurityProfile] = useState<UserProfileData | null>(null);
  const [officerName, setOfficerName] = useState('');
  const [officerPhone, setOfficerPhone] = useState('');

  // Terminal Settings
  const [gateName, setGateName] = useState('Main Gate 1');
  const [guardShift, setGuardShift] = useState('Day Shift (06:00 - 18:00)');
  const [autoBarcodeScan, setAutoBarcodeScan] = useState(true);
  const [loudAlerts, setLoudAlerts] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUserProfile();
        if (user) {
          setSecurityProfile(user);
          setOfficerName(user.fullName || '');
          setOfficerPhone(user.phone || '');
        }
      } catch (err) {
        console.error('Failed to load security profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSaveOfficerProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!officerName.trim()) {
      showToast('Please enter officer name.', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await updateUserProfile({
        fullName: officerName.trim(),
        phone: officerPhone.trim() || undefined,
      });

      if (res.success) {
        setSecurityProfile((prev) =>
          prev
            ? {
                ...prev,
                fullName: officerName.trim(),
                phone: officerPhone.trim() || null,
              }
            : null
        );
        showToast('Duty officer profile updated successfully.', 'success');
      } else {
        showToast(res.error || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while saving profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  function handleSaveTerminal(e: React.FormEvent) {
    e.preventDefault();
    setSavingTerminal(true);
    setTimeout(() => {
      setSavingTerminal(false);
      showToast('Gate console configuration saved.', 'success');
    }, 500);
  }

  const societyDisplay = securityProfile?.societyName || 'Society Security';
  const emailDisplay = securityProfile?.email || 'Not provided';
  const roleDisplay = securityProfile?.role ? securityProfile.role.toUpperCase() : 'SECURITY';

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Security Terminal Settings
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Configure duty guard profile, gate hardware, and intercom defaults for {societyDisplay}.
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <p className="text-sm">Loading security settings...</p>
        </div>
      ) : (
        <>
          {/* Card 1: Authenticated Duty Officer Profile */}
          <form
            onSubmit={handleSaveOfficerProfile}
            className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6 transition-colors"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Duty Officer Profile
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Authenticated guard credentials from Supabase
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Officer Name <span className="text-primary-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="Enter guard / officer name"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Gate Mobile Phone
                </label>
                <input
                  type="tel"
                  value={officerPhone}
                  onChange={(e) => setOfficerPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Guard Terminal Account Email
                </label>
                <input
                  type="email"
                  disabled
                  value={emailDisplay}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 cursor-not-allowed"
                />
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Provided by Supabase Auth (read-only).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  System Role
                </label>
                <input
                  type="text"
                  disabled
                  value={roleDisplay}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 cursor-not-allowed"
                />
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Assigned Security Console role.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {savingProfile ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Officer Profile
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Card 2: Terminal & Gate Configuration */}
          <form
            onSubmit={handleSaveTerminal}
            className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6 transition-colors"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Terminal &amp; Gate Configuration
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {societyDisplay} Checkpost Controls
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Gate / Checkpost Name
                </label>
                <input
                  type="text"
                  value={gateName}
                  onChange={(e) => setGateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Active Duty Shift
                </label>
                <select
                  value={guardShift}
                  onChange={(e) => setGuardShift(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-sm text-neutral-800 dark:text-neutral-100 bg-white dark:bg-[#1a2232] focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                >
                  <option value="Day Shift (06:00 - 18:00)" className="bg-white dark:bg-[#1a2232]">Day Shift (06:00 - 18:00)</option>
                  <option value="Night Shift (18:00 - 06:00)" className="bg-white dark:bg-[#1a2232]">Night Shift (18:00 - 06:00)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Auto-Scan Visitor QR Passes
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Automatically open barrier when valid resident guest pass is scanned
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoBarcodeScan}
                  onChange={(e) => setAutoBarcodeScan(e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded border-neutral-300 dark:border-neutral-700 focus:ring-primary-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    High-Volume Audio Alarm on Panic Trigger
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Sound audible siren from gate console during medical/fire panic alerts
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={loudAlerts}
                  onChange={(e) => setLoudAlerts(e.target.checked)}
                  className="w-5 h-5 text-primary-600 rounded border-neutral-300 dark:border-neutral-700 focus:ring-primary-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="submit"
                disabled={savingTerminal}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {savingTerminal ? 'Saving…' : 'Save Terminal Configuration'}
              </button>
            </div>
          </form>

          {/* Card 3: Theme Appearance */}
          <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6 transition-colors">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Theme &amp; Appearance
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Select interface appearance for this gate terminal
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => {
                  setTheme('light');
                  showToast('Light theme applied.', 'info');
                }}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-3',
                  theme === 'light'
                    ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-600/20'
                    : 'border-neutral-200 dark:border-[#222b3d] hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-[#1a2232]'
                )}
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Light Theme</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Clean, high-visibility daytime screen
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme('dark');
                  showToast('Dark theme applied.', 'info');
                }}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-3',
                  theme === 'dark'
                    ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-600/20'
                    : 'border-neutral-200 dark:border-[#222b3d] hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-[#1a2232]'
                )}
              >
                <div className="w-9 h-9 rounded-lg bg-neutral-800 text-neutral-200 flex items-center justify-center">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Dark Theme</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Night-shift mode for reduced glare
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTheme('system');
                  showToast('Theme set to follow system preference.', 'info');
                }}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-3',
                  theme === 'system'
                    ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-600/20'
                    : 'border-neutral-200 dark:border-[#222b3d] hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-[#1a2232]'
                )}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">System Sync</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Automatically syncs with operating system
                  </p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
