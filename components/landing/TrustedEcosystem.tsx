'use client';

import { useState, useRef } from 'react';
import {
  Home,
  Building2,
  ShieldCheck,
  Wrench,
  UserCheck,
  Package,
  MessageSquare,
  Receipt,
  Briefcase,
  Bell,
  Users,
  TrendingUp,
  Coins,
  ClipboardList,
  Handshake,
  Siren,
  FileText,
  Inbox,
  Calendar,
  Wallet,
  Star,
  type LucideIcon,
} from 'lucide-react';

interface RoleFeature {
  icon: LucideIcon;
  title: string;
  detail: string;
}

interface RoleItem {
  icon: LucideIcon;
  label: string;
  desc: string;
  features: RoleFeature[];
}

const roles: RoleItem[] = [
  {
    icon: Home,
    label: 'Resident',
    desc: 'Raise requests, track visitors, pay dues',
    features: [
      { icon: UserCheck, title: 'Visitor Management', detail: 'Pre-approve guests and get real-time gate arrival notifications.' },
      { icon: Package, title: 'Delivery Tracking', detail: 'Know exactly when your parcels arrive and collect them at your convenience.' },
      { icon: MessageSquare, title: 'Raise Complaints', detail: 'Log plumbing, electrical, or noise complaints and track resolution status.' },
      { icon: Receipt, title: 'Maintenance Dues', detail: 'View your maintenance bill, due dates, and payment history.' },
      { icon: Briefcase, title: 'Home Services', detail: 'Book verified plumbers, electricians, cleaners, and AC technicians on demand.' },
      { icon: Bell, title: 'Society Notices', detail: 'Stay updated with official society announcements and event RSVPs.' },
    ],
  },
  {
    icon: Building2,
    label: 'Management',
    desc: 'Oversee operations, send notices, collect payments',
    features: [
      { icon: Users, title: 'Residents Directory', detail: 'Browse all registered residents, flat assignments, and membership status.' },
      { icon: TrendingUp, title: 'Analytics Dashboard', detail: 'Real-time data on complaint resolution, maintenance collection %, and visitor traffic.' },
      { icon: Bell, title: 'Publish Notices', detail: 'Broadcast announcements to all residents instantly from the admin panel.' },
      { icon: Coins, title: 'Maintenance Collection', detail: 'Track dues collection across all flats — see paid, pending, and overdue.' },
      { icon: ClipboardList, title: 'Complaint Management', detail: 'Assign priority, update status, and resolve resident complaints transparently.' },
      { icon: Handshake, title: 'Service Partners', detail: 'Manage verified service providers and control their availability for residents.' },
    ],
  },
  {
    icon: ShieldCheck,
    label: 'Security',
    desc: 'Verify visitors, log entries, manage gates',
    features: [
      { icon: UserCheck, title: 'Visitor Verification', detail: 'Check pre-approved visitors, approve walk-ins, and log entry/exit timestamps.' },
      { icon: Package, title: 'Delivery Logging', detail: 'Record incoming parcels with courier name, flat number, and timestamp.' },
      { icon: Siren, title: 'Emergency Contacts', detail: 'One-tap access to police, fire brigade, ambulance, and admin escalation.' },
      { icon: FileText, title: 'Gate Activity Log', detail: 'Full audit trail of who entered and exited the premises throughout the day.' },
    ],
  },
  {
    icon: Wrench,
    label: 'Service Pro',
    desc: 'Accept bookings, update status, get paid',
    features: [
      { icon: Inbox, title: 'Booking Requests', detail: 'Receive and respond to resident service booking requests — accept or decline.' },
      { icon: Calendar, title: 'Job Schedule', detail: 'View your confirmed jobs for the day with flat details and service notes.' },
      { icon: Wallet, title: 'Earnings Tracker', detail: 'Monthly income summary, completed jobs count, and transaction history.' },
      { icon: Star, title: 'Ratings & Reviews', detail: 'Build your reputation through verified resident ratings after each job.' },
    ],
  },
];

export default function TrustedEcosystem() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabListRef = useRef<HTMLDivElement>(null);
  const active = roles[activeIndex];
  const ActiveRoleIcon = active.icon;

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % roles.length;
      setActiveIndex(nextIndex);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + roles.length) % roles.length;
      setActiveIndex(prevIndex);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[prevIndex]?.focus();
    }
  };

  return (
    <section className="bg-green-50/70 dark:bg-[#0c121e] py-16 px-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            One platform. Every stakeholder.
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm sm:text-base max-w-xl mx-auto">
            AavaasIQ connects everyone in your community. Select a role to explore.
          </p>
        </div>

        {/* Role Tab Buttons */}
        <div
          ref={tabListRef}
          role="tablist"
          aria-label="Stakeholder Roles"
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8"
        >
          {roles.map((role, i) => {
            const RoleIcon = role.icon;
            const isSelected = activeIndex === i;
            return (
              <button
                key={role.label}
                id={`role-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-controls={`role-panel-${i}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveIndex(i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={`min-h-[44px] flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors transition-transform transition-shadow duration-150 active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                  isSelected
                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                    : 'bg-white dark:bg-[#131924] border-neutral-200 dark:border-[#222b3d] text-neutral-600 dark:text-neutral-300 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-700 dark:hover:text-primary-300'
                }`}
              >
                <RoleIcon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`} strokeWidth={2} />
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Preview Panel */}
        <div
          id={`role-panel-${activeIndex}`}
          role="tabpanel"
          aria-labelledby={`role-tab-${activeIndex}`}
          className="bg-white dark:bg-[#131924] rounded-2xl border border-neutral-200 dark:border-[#222b3d] p-6 sm:p-8 shadow-sm transition-colors"
        >
          <div className="mb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/40 flex items-center justify-center shrink-0">
                <ActiveRoleIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">{active.label} Portal</h3>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{active.desc}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {active.features.map((f) => {
              const FeatureIcon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-[#0f141c] border border-neutral-100 dark:border-[#1e2a3a] hover:border-primary-200 dark:hover:border-primary-800/80 hover:-translate-y-0.5 hover:shadow-2xs transition-transform transition-colors transition-shadow duration-200"
                >
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#1a2232] border border-neutral-200/80 dark:border-[#2a3547] flex items-center justify-center shrink-0 text-primary-600 dark:text-primary-400 mt-0.5">
                    <FeatureIcon className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{f.title}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{f.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
