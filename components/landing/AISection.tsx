import Link from 'next/link';
import {
  Sparkles,
  Wrench,
  ShieldCheck,
  Bell,
  Star,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

interface AIFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const features: AIFeature[] = [
  {
    icon: Sparkles,
    title: 'Smart Complaint Routing',
    desc: 'Automatically routes complaints to the right team — maintenance, security, or management.',
  },
  {
    icon: Wrench,
    title: 'Predictive Maintenance Alerts',
    desc: 'Detects recurring patterns and alerts management before issues escalate.',
  },
  {
    icon: ShieldCheck,
    title: 'Smart Visitor Verification',
    desc: 'Assists security staff with visitor pattern analysis and pre-approvals.',
  },
  {
    icon: Bell,
    title: 'Automated Communication',
    desc: 'Sends timely notifications to residents about relevant events and updates.',
  },
  {
    icon: Star,
    title: 'Personalized Recommendations',
    desc: 'Suggests home services based on past bookings and seasonal needs.',
  },
  {
    icon: BarChart3,
    title: 'Society Performance Insights',
    desc: 'Gives management a data-backed view of complaint resolution and collection rates.',
  },
];

export default function AISection() {
  return (
    <section className="py-20 bg-white dark:bg-[#0b0f17] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left: content */}
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              AavaasIQ Intelligence
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 leading-snug mb-4 tracking-tight">
              Not just software.{' '}
              <span className="text-primary-600 dark:text-primary-400">An intelligent community companion.</span>
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-base leading-relaxed mb-6">
              AavaasIQ works quietly in the background — learning patterns, surfacing insights, and helping every stakeholder make better decisions without the complexity.
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              AI assistance appears where it matters, not everywhere. No gimmicks — just practical intelligence that saves time and reduces friction.
            </p>
            <Link
              href="/signup"
              className="mt-8 min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 active:scale-[0.98] transition-colors transition-transform duration-150"
            >
              Experience it yourself →
            </Link>
          </div>

          {/* Right: feature list card */}
          <div className="bg-primary-50/70 dark:bg-[#131924] border border-primary-100 dark:border-[#222b3d] rounded-2xl p-7 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-semibold text-primary-800 dark:text-primary-200">AavaasIQ Intelligence</span>
            </div>
            <ul className="space-y-4">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <li key={f.title} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#1a2232] border border-primary-200/60 dark:border-[#2a3547] text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{f.title}</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
