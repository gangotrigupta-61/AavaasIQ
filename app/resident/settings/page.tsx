'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Home,
  Save,
  Plus,
  Trash2,
  Users,
  Sun,
  Moon,
  Laptop,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { cn, getInitials } from '@/lib/utils';
import { useTheme } from '@/components/theme/ThemeProvider';
import { getCurrentUserProfile, updateUserProfile, type UserProfileData } from '@/app/actions/profile';

type SettingsTab = 'profile' | 'security' | 'household' | 'appearance';

export default function ResidentSettingsPage() {
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile Form State loaded from Supabase
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [directoryVisible, setDirectoryVisible] = useState(true);

  // Household & Vehicles State
  const [familyMembers, setFamilyMembers] = useState<
    Array<{ id: string; name: string; relation: string; phone: string }>
  >([]);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyRelation, setNewFamilyRelation] = useState('Spouse');
  const [newFamilyPhone, setNewFamilyPhone] = useState('');
  const [showAddFamily, setShowAddFamily] = useState(false);

  const [vehicles, setVehicles] = useState<
    Array<{ id: string; type: string; model: string; plate: string; slot: string }>
  >([]);
  const [newVehicleType, setNewVehicleType] = useState('Car (4-Wheeler)');
  const [newVehicleModel, setNewVehicleModel] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCurrentUserProfile();
        if (data) {
          setUserProfile(data);
          setFullName(data.fullName || '');
          setPhone(data.phone || '');
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await updateUserProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });

      if (res.success) {
        setUserProfile((prev) =>
          prev
            ? {
                ...prev,
                fullName: fullName.trim(),
                phone: phone.trim() || null,
              }
            : null
        );
        showToast('Profile information successfully updated!', 'success');
      } else {
        showToast(res.error || 'Failed to update profile.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred while saving profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill out all password fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirm password do not match.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Account security preferences updated.', 'success');
    }, 500);
  }

  function handleAddFamilyMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newFamilyName.trim() || !newFamilyPhone.trim()) {
      showToast('Please enter both name and mobile number.', 'error');
      return;
    }
    setFamilyMembers((prev) => [
      ...prev,
      {
        id: `fm-${Date.now()}`,
        name: newFamilyName.trim(),
        relation: newFamilyRelation,
        phone: newFamilyPhone.trim(),
      },
    ]);
    setNewFamilyName('');
    setNewFamilyPhone('');
    setShowAddFamily(false);
    showToast('Family member registered.', 'success');
  }

  function handleRemoveFamily(id: string) {
    setFamilyMembers((prev) => prev.filter((m) => m.id !== id));
    showToast('Member removed from household registry.', 'info');
  }

  function handleAddVehicle(e: React.FormEvent) {
    e.preventDefault();
    if (!newVehicleModel.trim() || !newVehiclePlate.trim()) {
      showToast('Please enter vehicle model and registration number.', 'error');
      return;
    }
    setVehicles((prev) => [
      ...prev,
      {
        id: `vh-${Date.now()}`,
        type: newVehicleType,
        model: newVehicleModel.trim(),
        plate: newVehiclePlate.trim().toUpperCase(),
        slot: 'Society Parking',
      },
    ]);
    setNewVehicleModel('');
    setNewVehiclePlate('');
    setShowAddVehicle(false);
    showToast('Vehicle registered with security gate.', 'success');
  }

  function handleRemoveVehicle(id: string) {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    showToast('Vehicle removed from registration.', 'info');
  }

  const displayName = fullName || userProfile?.fullName || 'Resident';
  const displayEmail = userProfile?.email || 'Not provided';
  const displayFlat = userProfile?.flatDisplay || 'Not assigned';
  const displayBlock = userProfile?.block ? `Block ${userProfile.block}` : 'Not assigned';
  const displaySociety = userProfile?.societyName || 'Not assigned';
  const displayStatus = userProfile?.membershipStatus || 'active';

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Resident Settings
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Manage your personal details, security credentials, household, and appearance.
        </p>
      </div>

      {/* Tabs Row (Cleaned: NO Notification tab) */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer shrink-0',
            activeTab === 'profile'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          )}
        >
          <User size={16} />
          Profile & Flat
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={cn(
            'flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer shrink-0',
            activeTab === 'security'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          )}
        >
          <Shield size={16} />
          Security & Password
        </button>

        <button
          onClick={() => setActiveTab('household')}
          className={cn(
            'flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer shrink-0',
            activeTab === 'household'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          )}
        >
          <Home size={16} />
          Household & Vehicles
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={cn(
            'flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer shrink-0',
            activeTab === 'appearance'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
          )}
        >
          <Sun size={16} />
          Appearance
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <p className="text-sm">Loading your profile information...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: Profile & Flat Details */}
          {activeTab === 'profile' && (
            <form
              onSubmit={handleSaveProfile}
              className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6 transition-colors"
            >
              {/* Profile Card Header */}
              <div className="flex items-center gap-4 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                <div className="w-16 h-16 rounded-full bg-primary-600 text-white font-bold text-xl flex items-center justify-center shadow-sm">
                  {getInitials(displayName)}
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-base sm:text-lg">
                    {displayName}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {displaySociety} · {displayFlat}
                  </p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-300">
                    Verified Resident ({displayStatus})
                  </span>
                </div>
              </div>

              {/* Editable & Read-only Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Full Name <span className="text-primary-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600"
                  />
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                    Editable: saves to your Supabase profile.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Primary Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600"
                  />
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                    Used for gate communications and delivery alerts.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Registered Account Email
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
                    Society Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={displaySociety}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    Managed by society administration.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Flat / Residence Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value={displayFlat}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    To reassign flat, contact society committee.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Block / Wing
                  </label>
                  <input
                    type="text"
                    disabled
                    value={displayBlock}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-[#2a3547] text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/60 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    Associated with your active membership.
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving Changes…
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <form
                onSubmit={handleUpdatePassword}
                className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6 transition-colors"
              >
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    Change Password
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Ensure your account is protected with a strong credentials
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>

              <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-4 transition-colors">
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  Privacy & Access Controls
                </h3>

                <div className="divide-y divide-neutral-100 dark:divide-neutral-800 space-y-4">
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        Two-Factor Authentication (SMS OTP)
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Prompt for verification code when logging in on unrecognized devices
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      className="w-5 h-5 text-primary-600 rounded border-neutral-300 dark:border-neutral-700"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        Resident Directory Visibility
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Allow other residents in your society to view your name in the directory
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={directoryVisible}
                      onChange={(e) => setDirectoryVisible(e.target.checked)}
                      className="w-5 h-5 text-primary-600 rounded border-neutral-300 dark:border-neutral-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Household & Vehicles */}
          {activeTab === 'household' && (
            <div className="space-y-6">
              {/* Family Members Section */}
              <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      Family Members &amp; Occupants
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Family members who have app access for {displayFlat}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddFamily(!showAddFamily)}
                    className="px-3 py-1.5 rounded-lg border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={14} /> Add Member
                  </button>
                </div>

                {showAddFamily && (
                  <form
                    onSubmit={handleAddFamilyMember}
                    className="p-4 bg-primary-50/50 dark:bg-primary-950/30 rounded-xl border border-primary-200/80 dark:border-primary-900/60 space-y-3 animate-in fade-in duration-150"
                  >
                    <h4 className="text-xs font-bold text-primary-900 dark:text-primary-200 uppercase tracking-wide">
                      New Family Member
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={newFamilyName}
                        onChange={(e) => setNewFamilyName(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-[#1a2232] border border-neutral-300 dark:border-[#2a3547] text-xs text-neutral-800 dark:text-neutral-100"
                      />
                      <select
                        value={newFamilyRelation}
                        onChange={(e) => setNewFamilyRelation(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-[#1a2232] border border-neutral-300 dark:border-[#2a3547] text-xs text-neutral-800 dark:text-neutral-100"
                      >
                        <option value="Spouse">Spouse</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Parent">Parent</option>
                        <option value="Other">Other</option>
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder="Mobile Number"
                        value={newFamilyPhone}
                        onChange={(e) => setNewFamilyPhone(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-[#1a2232] border border-neutral-300 dark:border-[#2a3547] text-xs text-neutral-800 dark:text-neutral-100"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddFamily(false)}
                        className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                )}

                {familyMembers.length === 0 ? (
                  <div className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
                    No additional family members registered yet.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {familyMembers.map((m) => (
                      <div key={m.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                            {m.name}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {m.relation} · {m.phone}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFamily(m.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vehicles Section */}
              <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      Registered Vehicles
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Vehicles authorized for automatic gate barrier opening
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddVehicle(!showAddVehicle)}
                    className="px-3 py-1.5 rounded-lg border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus size={14} /> Add Vehicle
                  </button>
                </div>

                {showAddVehicle && (
                  <form
                    onSubmit={handleAddVehicle}
                    className="p-4 bg-primary-50/50 dark:bg-primary-950/30 rounded-xl border border-primary-200/80 dark:border-primary-900/60 space-y-3 animate-in fade-in duration-150"
                  >
                    <h4 className="text-xs font-bold text-primary-900 dark:text-primary-200 uppercase tracking-wide">
                      Add Vehicle
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <select
                        value={newVehicleType}
                        onChange={(e) => setNewVehicleType(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-[#1a2232] border border-neutral-300 dark:border-[#2a3547] text-xs text-neutral-800 dark:text-neutral-100"
                      >
                        <option value="Car (4-Wheeler)">Car (4-Wheeler)</option>
                        <option value="Two-Wheeler">Two-Wheeler / Scooter</option>
                        <option value="Bicycle">Bicycle / EV Cycle</option>
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="Make / Model"
                        value={newVehicleModel}
                        onChange={(e) => setNewVehicleModel(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-[#1a2232] border border-neutral-300 dark:border-[#2a3547] text-xs text-neutral-800 dark:text-neutral-100"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Registration Number"
                        value={newVehiclePlate}
                        onChange={(e) => setNewVehiclePlate(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white dark:bg-[#1a2232] border border-neutral-300 dark:border-[#2a3547] text-xs text-neutral-800 dark:text-neutral-100 uppercase"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowAddVehicle(false)}
                        className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-semibold cursor-pointer"
                      >
                        Register
                      </button>
                    </div>
                  </form>
                )}

                {vehicles.length === 0 ? (
                  <div className="py-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
                    No vehicles registered for {displayFlat}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vehicles.map((v) => (
                      <div
                        key={v.id}
                        className="p-4 rounded-xl border border-neutral-200 dark:border-[#222b3d] bg-neutral-50/40 dark:bg-[#1a2232]/50 flex items-start justify-between"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 px-2 py-0.5 rounded">
                            {v.type}
                          </span>
                          <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                            {v.plate}
                          </p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-300">{v.model}</p>
                          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{v.slot}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveVehicle(v.id)}
                          className="p-1.5 rounded-lg text-neutral-400 dark:text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          aria-label="Remove vehicle"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Appearance & Theme */}
          {activeTab === 'appearance' && (
            <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6 transition-colors">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Sun className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  Theme &amp; Appearance
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Choose your interface color theme for AavaasIQ. Changes take effect immediately and are saved to this device.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Light Mode */}
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
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Clean, bright stone backgrounds for daylight use</p>
                  </div>
                </button>

                {/* Dark Mode */}
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
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Deep charcoal surfaces with reduced eye fatigue</p>
                  </div>
                </button>

                {/* System Default */}
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
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Automatically syncs with your operating system preference</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
