'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Building, MessageSquare } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    societyName: '',
    units: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  }

  function handleReset() {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      societyName: '',
      units: '',
      message: '',
    });
  }

  return (
    <section id="contact" className="py-24 bg-neutral-50 dark:bg-[#0b0f17] scroll-mt-16 border-t border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            Get In Touch
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
            Ready to transform your society? <br className="hidden sm:inline" />
            <span className="text-primary-600 dark:text-primary-400">Let&apos;s start the conversation.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-300">
            Schedule a personalized demo for your management committee or reach out for customer support. We usually respond within 2 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Contact Info Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Direct Contact</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Have questions about onboarding, features, or pricing? Our community specialists are ready to help.
              </p>

              <div className="space-y-4 pt-2">
                <a
                  href="tel:+918045678900"
                  className="flex items-start gap-4 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/60 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">Phone Support</p>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">+91 80 4567 8900</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Toll-free across India</p>
                  </div>
                </a>

                <a
                  href="mailto:support@aavaasiq.in"
                  className="flex items-start gap-4 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/60 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">Email Inquiries</p>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">support@aavaasiq.in</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Sales & general queries</p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">Headquarters</p>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      Level 4, Aavaas Tower, 100ft Road
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Indiranagar, Bengaluru, KA 560038</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3.5 rounded-xl border border-neutral-100 dark:border-neutral-800">
                  <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500">Operating Hours</p>
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Mon – Sat: 9:00 AM – 7:00 PM</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">24/7 emergency escalation for security</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick trust badge */}
            <div className="p-5 rounded-2xl bg-primary-600 text-white flex items-center gap-4">
              <Building className="w-8 h-8 text-primary-200 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Need an in-person demo for your RWA?</p>
                <p className="text-xs text-primary-100 mt-0.5">
                  Our city reps can present directly to your management committee.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Interactive Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-950/80 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Thank You, {formData.name || 'Friend'}!</h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm max-w-md mx-auto leading-relaxed">
                  Your inquiry regarding <strong className="text-neutral-800 dark:text-neutral-100">{formData.societyName || 'your society'}</strong> has been received. Our community specialist will reach out within 2 hours with demonstration access.
                </p>
                <div className="pt-4">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">Send a Message or Request a Demo</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5">Fill in your details below and we&apos;ll set up a live walkthrough.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Seth"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="vikram@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Society / Apartment Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Green Valley Residency"
                      value={formData.societyName}
                      onChange={(e) => setFormData({ ...formData, societyName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Number of Flats / Units (Approx.)
                  </label>
                  <select
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-[#2a3547] text-sm text-neutral-800 dark:text-neutral-100 bg-white dark:bg-[#1a2232] focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                  >
                    <option value="" className="bg-white dark:bg-[#1a2232] text-neutral-500">Select community size</option>
                    <option value="under50" className="bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-100">Under 50 flats</option>
                    <option value="50-200" className="bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-100">50 - 200 flats</option>
                    <option value="200-500" className="bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-100">200 - 500 flats</option>
                    <option value="500+" className="bg-white dark:bg-[#1a2232] text-neutral-800 dark:text-neutral-100">500+ flats (Mega Township)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    How can we help you? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your society's current challenges or what features you are interested in exploring..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 dark:border-[#2a3547] bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/30 focus:border-primary-600 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending Request…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
