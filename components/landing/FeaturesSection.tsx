import {
  UserCheck,
  Wrench,
  MessageSquare,
  Package,
  Bell,
  Calendar,
  Briefcase,
  Siren,
} from "lucide-react";

interface FeatureItem {
  icon: typeof UserCheck;
  title: string;
  desc: string;
  steps: [string, string, string];
}

const features: FeatureItem[] = [
  {
    icon: UserCheck,
    title: "Visitor Management",
    desc: "Track and approve visitor entries in real-time.",
    steps: ["Pre-approval", "Gate check", "Entry"],
  },
  {
    icon: Wrench,
    title: "Maintenance",
    desc: "Raise and track maintenance requests easily.",
    steps: ["Log request", "Assigned", "Resolved"],
  },
  {
    icon: MessageSquare,
    title: "Complaints",
    desc: "Log and follow up on complaints with transparency.",
    steps: ["Raise issue", "Track status", "Resolution"],
  },
  {
    icon: Package,
    title: "Deliveries",
    desc: "Get notified when your parcels arrive.",
    steps: ["Gate arrival", "Notification", "Collected"],
  },
  {
    icon: Bell,
    title: "Notices",
    desc: "Stay updated with society announcements.",
    steps: ["Admin post", "Read alert", "Take action"],
  },
  {
    icon: Calendar,
    title: "Events & RSVPs",
    desc: "Participate in community gatherings and celebrations.",
    steps: ["Announcement", "RSVP", "Community"],
  },
  {
    icon: Briefcase,
    title: "Home Services",
    desc: "Book verified plumbers, electricians, and technicians.",
    steps: ["Choose pro", "Book slot", "Service done"],
  },
  {
    icon: Siren,
    title: "Emergency",
    desc: "Instant emergency alerts for residents and security.",
    steps: ["Select contact", "Instant call", "Response"],
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 px-4 bg-white dark:bg-[#0b0f17] transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 tracking-widest uppercase mb-3">
            Platform Features
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Everything Your Society Needs
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-base max-w-lg mx-auto">
            A complete digital solution for modern residential communities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc, steps }) => (
            <div
              key={title}
              className="group bg-white dark:bg-[#131924] rounded-xl p-5 sm:p-6 border border-neutral-200 dark:border-[#222b3d] hover:border-primary-300 dark:hover:border-primary-700/60 hover:-translate-y-1 hover:shadow-md transition-transform transition-shadow transition-colors duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="inline-flex items-center justify-center bg-primary-50 dark:bg-primary-950/60 rounded-lg p-2.5 mb-4 group-hover:scale-105 transition-transform duration-200">
                  <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" strokeWidth={1.75} />
                </div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">{desc}</p>
              </div>

              {/* Compact, visually secondary workflow progression */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-[#1e2a3a] flex items-center flex-wrap gap-1 text-[11px] text-neutral-400 dark:text-neutral-500 font-medium select-none">
                <span>{steps[0]}</span>
                <span className="text-neutral-300 dark:text-neutral-600">→</span>
                <span>{steps[1]}</span>
                <span className="text-neutral-300 dark:text-neutral-600">→</span>
                <span className="text-neutral-600 dark:text-neutral-300 font-semibold">{steps[2]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
