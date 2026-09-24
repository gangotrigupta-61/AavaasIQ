const steps = [
  {
    number: '01',
    title: 'Join Your Society',
    desc: 'Enter your society code and flat number. Your management committee approves your access.',
  },
  {
    number: '02',
    title: 'Manage Everything',
    desc: 'Visitors, complaints, services, payments — all in one place from any device.',
  },
  {
    number: '03',
    title: 'Live Better',
    desc: 'Enjoy a more organised, transparent and connected residential community.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-neutral-50 dark:bg-[#0b0f17] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 tracking-widest uppercase mb-3">
            Simple Onboarding
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">How It Works</h2>
          <p className="mt-3 text-neutral-500 dark:text-neutral-400 text-base max-w-lg mx-auto">
            Getting started with AavaasIQ takes minutes, not days.
          </p>
        </div>

        {/* Steps */}
        <div className="relative flex flex-col md:flex-row items-center md:items-stretch justify-center gap-6 md:gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col md:flex-row items-center flex-1 w-full">
              {/* Step card */}
              <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 border border-neutral-200/80 dark:border-[#222b3d] shadow-2xs hover:shadow-md hover:-translate-y-1 transition-transform transition-shadow duration-200 flex flex-col items-center text-center flex-1 w-full mx-2">
                <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mb-5 shadow-xs">
                  <span className="text-white font-bold text-lg">{step.number}</span>
                </div>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs">{step.desc}</p>
              </div>

              {/* Arrow connector (between steps) */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center px-2 text-neutral-300 dark:text-neutral-700 text-2xl font-light select-none">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
