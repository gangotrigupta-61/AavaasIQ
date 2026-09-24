'use client';

import { useState, useEffect } from 'react';
import { Wrench, Save, Sun, Moon, Laptop, UserCheck, Loader2, MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { useTheme } from '@/components/theme/ThemeProvider';
import { cn } from '@/lib/utils';
import { getCurrentUserProfile, updateUserProfile, type UserProfileData } from '@/app/actions/profile';
import { updateProviderBusinessDetails } from '@/app/actions/services';

export default function ProviderSettingsPage() {
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [locatingDevice, setLocatingDevice] = useState(false);

  // Authenticated Provider Profile State
  const [providerProfile, setProviderProfile] = useState<UserProfileData | null>(null);
  const [technicianName, setTechnicianName] = useState('');
  const [technicianPhone, setTechnicianPhone] = useState('');

  // Business Profile Settings
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('Plumbing');
  const [visitingFee, setVisitingFee] = useState('299');
  const [availableNow, setAvailableNow] = useState(true);
  const [upiId, setUpiId] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUserProfile();
        if (user) {
          setProviderProfile(user);
          setTechnicianName(user.fullName || '');
          setTechnicianPhone(user.phone || '');
          setBusinessName(user.providerName || user.fullName || 'Professional Services');
          if (user.providerCategory) {
            setCategory(user.providerCategory);
          }
          if (user.providerStartingPrice) {
            setVisitingFee(String(user.providerStartingPrice));
          }
          if (user.providerAvailable !== undefined && user.providerAvailable !== null) {
            setAvailableNow(user.providerAvailable);
          }
          if (user.providerAddress) {
            setAddress(user.providerAddress);
          }
          if (user.providerLatitude != null) {
            setLatitude(String(user.providerLatitude));
          }
          if (user.providerLongitude != null) {
            setLongitude(String(user.providerLongitude));
          }
        }
      } catch (err) {
        console.error('Failed to load provider profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSaveProviderProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!technicianName.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await updateUserProfile({
        fullName: technicianName.trim(),
        phone: technicianPhone.trim() || undefined,
      });

      if (res.success) {
        setProviderProfile((prev) =>
          prev
            ? {
                ...prev,
                fullName: technicianName.trim(),
                phone: technicianPhone.trim() || null,
              }
            : null
        );
        showToast('Technician profile updated successfully.', 'success');
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

  function handleUseCurrentDeviceLocation() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    setLocatingDevice(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocatingDevice(false);
        showToast('Current coordinates populated. Click "Save Business Settings" to confirm.', 'info');
      },
      (err) => {
        setLocatingDevice(false);
        if (err.code === err.PERMISSION_DENIED) {
          showToast('Location permission was denied by your browser.', 'error');
        } else {
          showToast('Unable to acquire current device location.', 'error');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  async function handleSaveBusiness(e: React.FormEvent) {
    e.preventDefault();
    setSavingBusiness(true);

    const parsedLat = latitude.trim() ? parseFloat(latitude.trim()) : null;
    const parsedLng = longitude.trim() ? parseFloat(longitude.trim()) : null;

    if (latitude.trim() && (parsedLat === null || isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90)) {
      showToast('Please enter a valid decimal latitude between -90 and 90.', 'error');
      setSavingBusiness(false);
      return;
    }
    if (longitude.trim() && (parsedLng === null || isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180)) {
      showToast('Please enter a valid decimal longitude between -180 and 180.', 'error');
      setSavingBusiness(false);
      return;
    }

    try {
      const res = await updateProviderBusinessDetails({
        businessName,
        category,
        startingPrice: Number(visitingFee) || 299,
        available: availableNow,
        address: address.trim() || null,
        latitude: parsedLat,
        longitude: parsedLng,
      });

      if (res.error) {
        showToast(res.error, 'error');
      } else {
        showToast('Business details and service location saved successfully.', 'success');
      }
    } catch {
      showToast('An unexpected error occurred while saving business details.', 'error');
    } finally {
      setSavingBusiness(false);
    }
  }

  const emailDisplay = providerProfile?.email || 'Not provided';
  const societyDisplay = providerProfile?.societyName || 'Registered Society';
  const categoryDisplay = providerProfile?.providerCategory || 'Home Services';

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Provider Partner Settings
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Manage your verified credentials, service catalog, visiting fee, and booking availability.
        </p>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <p className="text-sm">Loading partner settings...</p>
        </div>
      ) : (
        <>
          {/* Card 1: Authenticated Technician Profile */}
          <form
            onSubmit={handleSaveProviderProfile}
            className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6 transition-colors"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Technician Identity &amp; Profile
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Authenticated partner credentials from Supabase
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
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Contact Mobile Phone
                </label>
                <input
                  type="tel"
                  value={technicianPhone}
                  onChange={(e) => setTechnicianPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Registered Account Email
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
                  Primary Service Domain
                </label>
                <input
                  type="text"
                  disabled
                  value={categoryDisplay}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 cursor-not-allowed"
                />
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Verified category from service directory.
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
                    Save Technician Profile
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Card 2: Business & Service Profile */}
          <form
            onSubmit={handleSaveBusiness}
            className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6 transition-colors"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Service Partner Business Profile
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Verified Service Partner in {societyDisplay}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Business / Trade Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Primary Trade Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-sm text-neutral-800 dark:text-neutral-100 bg-white dark:bg-[#1a2232] focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                >
                  <option value="Plumbing" className="bg-white dark:bg-[#1a2232]">Plumbing</option>
                  <option value="Electrical" className="bg-white dark:bg-[#1a2232]">Electrical</option>
                  <option value="Cleaning" className="bg-white dark:bg-[#1a2232]">Deep Cleaning</option>
                  <option value="Carpentry" className="bg-white dark:bg-[#1a2232]">Carpentry</option>
                  <option value="Appliance" className="bg-white dark:bg-[#1a2232]">AC &amp; Appliance Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Standard Visiting Charge (₹)
                </label>
                <input
                  type="number"
                  value={visitingFee}
                  onChange={(e) => setVisitingFee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Settlement UPI ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. partner@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              {/* Service Base Location */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Service Area / Operating Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                  <input
                    type="text"
                    placeholder="e.g. Gomti Nagar, Lucknow"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                  Displayed on your public provider card so residents know your service base.
                </p>
              </div>

              {/* Coordinates */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Latitude (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 26.850000"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Longitude (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 80.950000"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 outline-none"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleUseCurrentDeviceLocation}
                  disabled={locatingDevice}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-neutral-50 dark:bg-[#1a2232] hover:bg-neutral-100 dark:hover:bg-[#20293a] text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {locatingDevice ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-600" />
                      <span>Detecting Coordinates…</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                      <span>Use Current Device Location</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  Coordinates enable direct navigation and distance estimates on resident devices.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  Instant Booking Availability
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Show &ldquo;Available Now&rdquo; badge to residents in Home Services marketplace
                </p>
              </div>
              <input
                type="checkbox"
                checked={availableNow}
                onChange={(e) => setAvailableNow(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded border-neutral-300 dark:border-neutral-700 focus:ring-primary-500 cursor-pointer"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="submit"
                disabled={savingBusiness}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {savingBusiness ? 'Saving…' : 'Save Business Settings'}
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
                  Select interface appearance for your provider console
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
                    Clean, bright stone backgrounds
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
                    Deep charcoal surfaces with reduced glare
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
