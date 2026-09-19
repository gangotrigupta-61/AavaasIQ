export default function TrustedEcosystem() {
  const stakeholders = [
    { icon: "🏠", label: "Resident", desc: "Raise requests, track visitors, pay dues" },
    { icon: "🏢", label: "Management", desc: "Oversee operations, send notices, collect payments" },
    { icon: "🔒", label: "Security", desc: "Verify visitors, log entries, manage gates" },
    { icon: "🔧", label: "Service Pro", desc: "Accept bookings, update status, get paid" },
  ];

  return (
    <section className="bg-green-50/70 dark:bg-[#0c121e] py-16 px-4 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
            One platform. Every stakeholder.
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-base">
            AavaasIQ connects everyone in your community.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
          {stakeholders.map((s, index) => (
            <div key={s.label} className="flex flex-col md:flex-row items-center">
              <div className="bg-white dark:bg-[#131924] rounded-xl p-5 shadow-sm border border-neutral-100 dark:border-[#222b3d] w-52 flex flex-col items-center text-center gap-3 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/80 flex items-center justify-center text-2xl">
                  {s.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{s.label}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
              {index < stakeholders.length - 1 && (
                <div className="flex items-center justify-center">
                  <span className="hidden md:block text-green-400 dark:text-green-500 font-bold text-xl mx-3 select-none">→</span>
                  <span className="md:hidden text-green-400 dark:text-green-500 font-bold text-xl my-1 select-none">↓</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
