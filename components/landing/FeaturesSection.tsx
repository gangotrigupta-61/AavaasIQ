import {
  Users,
  Wrench,
  AlertCircle,
  Package,
  Bell,
  Calendar,
  Briefcase,
  Shield,
} from "lucide-react";

const features = [
  { icon: Users,        title: "Visitor Management", desc: "Track and approve visitor entries in real-time." },
  { icon: Wrench,       title: "Maintenance",         desc: "Raise and track maintenance requests easily." },
  { icon: AlertCircle,  title: "Complaints",          desc: "Log and follow up on complaints with transparency." },
  { icon: Package,      title: "Deliveries",          desc: "Get notified when your parcels arrive." },
  { icon: Bell,         title: "Notices",             desc: "Stay updated with society announcements." },
  { icon: Calendar,     title: "Events & RSVPs",      desc: "Participate in community gatherings and celebrations." },
  { icon: Briefcase,    title: "Home Services",       desc: "Book verified plumbers, electricians, and technicians." },
  { icon: Shield,       title: "Emergency",           desc: "Instant emergency alerts for residents and security." },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 px-4 bg-white dark:bg-[#0b0f17] transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-green-600 dark:text-green-400 tracking-widest uppercase mb-3">
            Platform Features
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Everything Your Society Needs
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-base max-w-lg mx-auto">
            A complete digital solution for modern residential communities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white dark:bg-[#131924] rounded-xl p-6 border border-neutral-200 dark:border-[#222b3d] hover:shadow-md transition-all"
            >
              <div className="inline-flex items-center justify-center bg-green-50 dark:bg-green-950/60 rounded-lg p-2 mb-4">
                <Icon className="w-5 h-5 text-green-600 dark:text-green-400" strokeWidth={1.75} />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{title}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
