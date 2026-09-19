'use client';

import Link from 'next/link';
import {
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Car,
  Heart,
  QrCode,
  Download,
  Settings,
  Calendar,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { getInitials } from '@/lib/utils';
import type { UserProfileData } from '@/app/actions/profile';

interface ResidentProfileClientProps {
  profile: UserProfileData | null;
}

export default function ResidentProfileClient({ profile }: ResidentProfileClientProps) {
  const { showToast } = useToast();

  function handleDownloadPass() {
    showToast('Digital Society Gate Pass downloaded to your device.', 'success');
  }

  const fullName = profile?.fullName || 'Not provided';
  const societyName = profile?.societyName || 'Not available';
  const flatDisplay = profile?.flatDisplay || 'Not assigned';
  const blockDisplay = profile?.block ? `Block ${profile.block}` : 'Not assigned';
  const email = profile?.email || 'Not provided';
  const phone = profile?.phone || 'Not provided';
  const membershipStatus = profile?.membershipStatus === 'active' ? 'Active / Allowed' : 'Not available';
  const isVerified = profile?.membershipStatus === 'active';
  const memberSince = profile?.memberSince || 'Not available';
  // Pass ID is not stored in DB, display honest 'Not available' per production rules
  const passNumber = 'Not available';

  return (
    <div className="space-y-8 max-w-5xl pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Resident Profile &amp; Pass
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Your official community membership credentials and gate pass.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPass}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#131924] text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download size={14} />
            Download Digital Pass
          </button>
          <Link
            href="/resident/settings"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            <Settings size={14} />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Grid: Digital Pass Card (Left) + Detailed Info (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Digital Society ID Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 text-white rounded-3xl p-6 shadow-xl border border-neutral-700/60 relative overflow-hidden">
            {/* Holographic style subtle background element */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header: Logo & Chip */}
            <div className="flex items-center justify-between border-b border-neutral-700/60 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                  <Building2 size={16} />
                </div>
                <div>
                  <p className="font-extrabold text-sm tracking-tight text-white leading-tight">AavaasIQ</p>
                  <p className="text-[10px] text-neutral-400">{societyName}</p>
                </div>
              </div>
              <span
                className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isVerified
                    ? 'text-emerald-400 bg-emerald-950/80 border-emerald-800/60'
                    : 'text-amber-400 bg-amber-950/80 border-amber-800/60'
                }`}
              >
                <ShieldCheck size={12} />
                {isVerified ? 'Verified' : 'Pending'}
              </span>
            </div>

            {/* Resident Avatar & Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center font-black text-2xl shadow-inner border-2 border-white/20">
                {getInitials(fullName)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">{fullName}</h3>
                <p className="text-primary-300 text-sm font-semibold mt-0.5">{flatDisplay}</p>
                <p className="text-neutral-400 text-xs">
                  {profile?.role === 'resident' ? 'Resident Member' : (profile?.role || 'Member')}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 py-3 border-y border-neutral-700/60 text-xs mb-5">
              <div>
                <span className="text-neutral-400 text-[10px] uppercase font-semibold">Pass Number</span>
                <p className="font-mono text-neutral-200 font-bold mt-0.5">{passNumber}</p>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] uppercase font-semibold">Block / Wing</span>
                <p className="text-neutral-200 font-bold mt-0.5">{blockDisplay}</p>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] uppercase font-semibold">Member Since</span>
                <p className="text-neutral-200 font-medium mt-0.5">{memberSince}</p>
              </div>
              <div>
                <span className="text-neutral-400 text-[10px] uppercase font-semibold">Gate Status</span>
                <p
                  className={`font-bold mt-0.5 ${
                    isVerified ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {membershipStatus}
                </p>
              </div>
            </div>

            {/* QR Code Auto-Scan Representation */}
            <div className="bg-neutral-800/80 rounded-2xl p-4 border border-neutral-700/80 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Security Gate Pass</p>
                <p className="text-[11px] text-neutral-400">Scan at barrier for entry verification</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
                <QrCode className="w-10 h-10 text-neutral-900" />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center">
            Present this digital card to security guards or delivery executives for identity verification.
          </p>
        </div>

        {/* Right: Detailed Membership Info (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Contact & Flat Info Card */}
          <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6 transition-colors">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Resident Details &amp; Contacts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#1a2232]">
                <Phone className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">Mobile Number</p>
                  <p className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">{phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#1a2232]">
                <Mail className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">Email Address</p>
                  <p className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#1a2232]">
                <Car className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">Primary Registered Vehicle</p>
                  <p className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">Not provided</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#1a2232]">
                <Heart className="w-4 h-4 text-red-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">Emergency Contact</p>
                  <p className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate">Not provided</p>
                </div>
              </div>
            </div>
          </div>

          {/* Society Standing & Quick Actions */}
          <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-4 transition-colors">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              Community Overview &amp; Quick Access
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1a2232] border border-neutral-100 dark:border-neutral-800">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{societyName}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Registered Society</p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1a2232] border border-neutral-100 dark:border-neutral-800">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{flatDisplay}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Assigned Flat</p>
              </div>
            </div>

            {/* Quick action cards */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/resident/maintenance"
                className="flex-1 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/40 dark:hover:bg-primary-950/30 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 transition-colors"
              >
                <CreditCard className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>View Maintenance Bills</span>
              </Link>
              <Link
                href="/resident/visitors"
                className="flex-1 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/40 dark:hover:bg-primary-950/30 text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <span>Manage Gate Passes</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
