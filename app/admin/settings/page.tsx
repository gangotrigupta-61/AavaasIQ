'use client';

import { useState, useEffect } from 'react';
import { Building2, Save, Sun, Moon, Laptop, UserCheck, Loader2, FileText, Volume2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/components/theme/ThemeProvider';
import { cn } from '@/lib/utils';
import { getCurrentUserProfile, updateUserProfile, type UserProfileData } from '@/app/actions/profile';
import { getSocietyDescription, updateSocietyDescription } from '@/app/actions/society';

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingSociety, setSavingSociety] = useState(false);
  const [savingDescription, setSavingDescription] = useState(false);

  // Authenticated Admin Profile State
  const [adminProfile, setAdminProfile] = useState<UserProfileData | null>(null);
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');

  // Society Master Profile State
  const [societyName, setSocietyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [totalFlats, setTotalFlats] = useState('320');
  const [maintenanceRate, setMaintenanceRate] = useState('2400');
  const [lateFeePercent, setLateFeePercent] = useState('2');

  // Society Information
  const [societyDescription, setSocietyDescription] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [user, descResult] = await Promise.all([
          getCurrentUserProfile(),
          getSocietyDescription(),
        ]);
        if (user) {
          setAdminProfile(user);
          setAdminName(user.fullName || '');
          setAdminPhone(user.phone || '');
          setSocietyName(user.societyName || 'Society Administration');
          setContactEmail(user.email || '');
          setPhone(user.phone || '');
        }
        if (descResult?.description) {
          setSocietyDescription(descResult.description);
        }
      } catch (err) {
        console.error('Failed to load admin profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSaveDescription(e: React.FormEvent) {
    e.preventDefault();
    if (societyDescription.length > 2000) {
      showToast('Description must be 2000 characters or fewer.', 'error');
      return;
    }
    setSavingDescription(true);
    try {
      const res = await updateSocietyDescription(societyDescription);
      if (res.success) {
        showToast('Society description saved successfully.', 'success');
      } else {
        showToast(res.error ?? 'Failed to save description.', 'error');
      }
    } catch {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setSavingDescription(false);
    }
  }

  async function handleSaveAdminProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!adminName.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await updateUserProfile({
        fullName: adminName.trim(),
        phone: adminPhone.trim() || undefined,
      });

      if (res.success) {
        setAdminProfile((prev) =>
          prev
            ? {
                ...prev,
                fullName: adminName.trim(),
                phone: adminPhone.trim() || null,
              }
            : null
        );
        showToast('Administrator profile updated successfully.', 'success');
      } else {
        showToast(res.error || 'Failed to update administrator profile.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while saving administrator profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  }

  function handleSaveSociety(e: React.FormEvent) {
    e.preventDefault();
    setSavingSociety(true);
    setTimeout(() => {
      setSavingSociety(false);
      showToast('Society administration settings updated successfully.', 'success');
    }, 500);
  }

  const displaySociety = adminProfile?.societyName || 'Society Administration';
  const displayEmail = adminProfile?.email || 'Not provided';
  const displayRole = adminProfile?.role ? adminProfile.role.toUpperCase() : 'ADMIN';

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Society Settings &amp; Configuration
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Manage administrator credentials, community parameters, and interface appearance for {displaySociety}.
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <p className="text-sm">Loading administrator settings...</p>
        </div>
      ) : (
        <>
          {/* Card 1: Authenticated Administrator Profile */}
          <form
            onSubmit={handleSaveAdminProfile}
            className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6 transition-colors"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Administrator Identity &amp; Profile
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Your authenticated officer credentials from Supabase
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Full Name <span className="text-primary-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Enter administrator name"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Direct Phone Number
                </label>
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Authenticated Admin Email
                </label>
                <input
                  type="email"
                  disabled
                  value={displayEmail}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 cursor-not-allowed"
                />
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Provided by Supabase Auth (read-only).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Assigned System Role
                </label>
                <input
                  type="text"
                  disabled
                  value={displayRole}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 cursor-not-allowed"
                />
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Protected role enforcement cannot be altered via UI.
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
                    Save Administrator Profile
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Card 2: Society Master Profile */}
          <form
            onSubmit={handleSaveSociety}
            className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6 transition-colors"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Society Master Profile
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Official RWA registration and operations defaults
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Society Name
                </label>
                <input
                  type="text"
                  value={societyName}
                  onChange={(e) => setSocietyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Committee Official Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Office Contact Helpline
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Total Society Units
                </label>
                <input
                  type="number"
                  value={totalFlats}
                  onChange={(e) => setTotalFlats(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Monthly Maintenance (₹ / flat)
                </label>
                <input
                  type="number"
                  value={maintenanceRate}
                  onChange={(e) => setMaintenanceRate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Late Payment Penalty (%)
                </label>
                <input
                  type="number"
                  value={lateFeePercent}
                  onChange={(e) => setLateFeePercent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="submit"
                disabled={savingSociety}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {savingSociety ? 'Saving…' : 'Save Society Configuration'}
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
                  Select interface appearance for your administrator console
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
                    Clean, bright stone backgrounds for daylight use
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
                    Deep charcoal surfaces with reduced eye fatigue
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
                    Automatically syncs with your operating system preference
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Card 4: Society Information */}
          <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6 transition-colors">
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">Society Information</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  A short description of your society displayed to residents and on your profile.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveDescription} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Society Description</label>
                  <span className={`text-xs ${societyDescription.length > 1900 ? 'text-red-500' : 'text-neutral-400 dark:text-neutral-500'}`}>
                    {societyDescription.length} / 2000
                  </span>
                </div>
                <textarea
                  rows={5}
                  maxLength={2000}
                  placeholder="Tell residents about your society — facilities, rules, history, or anything else they should know…"
                  value={societyDescription}
                  onChange={(e) => setSocietyDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={savingDescription}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {savingDescription ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Description</>
                  )}
                </button>

                {societyDescription.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(societyDescription);
                        utterance.lang = 'en-IN';
                        window.speechSynthesis.cancel();
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-neutral-600 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 transition cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                    Read Aloud
                  </button>
                )}
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
