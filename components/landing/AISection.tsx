import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const features = [
  {
    icon: '🧠',
    title: 'Smart Complaint Routing',
    desc: 'Automatically routes complaints to the right team — maintenance, security, or management.',
  },
  {
    icon: '🔧',
    title: 'Predictive Maintenance Alerts',
    desc: 'Detects recurring patterns and alerts management before issues escalate.',
  },
  {
    icon: '🔐',
    title: 'Smart Visitor Verification',
    desc: 'Assists security staff with visitor pattern analysis and pre-approvals.',
  },
  {
    icon: '📢',
    title: 'Automated Communication',
    desc: 'Sends timely notifications to residents about relevant events and updates.',
  },
  {
    icon: '⭐',
    title: 'Personalized Recommendations',
    desc: 'Suggests home services based on past bookings and seasonal needs.',
  },
  {
    icon: '📊',
    title: 'Society Performance Insights',
    desc: 'Gives management a data-backed view of complaint resolution and collection rates.',
  },
];

export default function AISection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left: content */}
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              AavaasIQ Intelligence
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 leading-snug mb-4">
              Not just software.{' '}
              <span className="text-primary-600">An intelligent community companion.</span>
            </h2>
            <p className="text-neutral-500 text-base leading-relaxed mb-6">
              AavaasIQ works quietly in the background — learning patterns, surfacing insights, and helping every stakeholder make better decisions without the complexity.
            </p>
            <p className="text-sm text-neutral-400 leading-relaxed">
              AI assistance appears where it matters, not everywhere. No gimmicks — just practical intelligence that saves time and reduces friction.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
            >
              Experience it yourself →
            </Link>
          </div>

          {/* Right: feature list card */}
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-7">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-primary-800">AavaasIQ Intelligence</span>
            </div>
            <ul className="space-y-4">
              {features.map((f) => (
                <li key={f.title} className="flex items-start gap-3">
                  <span className="text-base mt-0.5 shrink-0">{f.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{f.title}</p>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
