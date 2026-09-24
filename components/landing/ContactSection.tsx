'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Building, MessageSquare, AlertCircle } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      nextErrors.name = 'Please enter your name (minimum 2 characters).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      nextErrors.message = 'Please provide a message with at least 10 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    // Simulate clean, deterministic submission state
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 450);
  }

  function handleReset() {
    setSubmitted(false);
    setErrors({});
    setFormData({
      name: '',
      email: '',
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
            Ready to modernize your society? <br className="hidden sm:inline" />
            <span className="text-primary-600 dark:text-primary-400">Let&apos;s start the conversation.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-neutral-300">
            Have questions about onboarding, features, or support? Send us a message and our team will get back to you promptly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Direct Contact Information (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Direct Contact</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Connect directly with our community specialists for platform guidance or inquiries.
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
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">General and onboarding queries</p>
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
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Support hours for management committees</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick committee info */}
            <div className="p-5 rounded-2xl bg-primary-600 text-white flex items-center gap-4">
              <Building className="w-8 h-8 text-primary-200 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Need assistance for your RWA?</p>
                <p className="text-xs text-primary-100 mt-0.5">
                  We provide dedicated onboarding support for residential management committees.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Streamlined 3-Field Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#131924] rounded-2xl p-6 sm:p-8 border border-neutral-200 dark:border-[#222b3d] shadow-sm">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-950/80 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Thank You, {formData.name.trim()}!
                </h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-sm max-w-md mx-auto leading-relaxed">
                  Your message has been received. Our team will review your inquiry and reply to{' '}
                  <strong className="text-neutral-800 dark:text-neutral-100">{formData.email.trim()}</strong>.
                </p>
                <div className="pt-4">
                  <button
                    onClick={handleReset}
                    className="min-h-[44px] px-5 py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium active:scale-[0.98] transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                    Send a Message
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5">
                    Fill in your details below and our team will get in touch with you.
                  </p>
                </div>

                {/* 1. Name */}
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    className={`w-full min-h-[42px] px-3.5 py-2.5 rounded-lg border ${
                      errors.name
                        ? 'border-red-500 dark:border-red-600 focus:ring-red-500/20'
                        : 'border-neutral-300 dark:border-[#2a3547] focus:border-primary-600 focus:ring-primary-600/30'
                    } bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* 2. Email */}
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full min-h-[42px] px-3.5 py-2.5 rounded-lg border ${
                      errors.email
                        ? 'border-red-500 dark:border-red-600 focus:ring-red-500/20'
                        : 'border-neutral-300 dark:border-[#2a3547] focus:border-primary-600 focus:ring-primary-600/30'
                    } bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* 3. Message */}
                <div>
                  <label htmlFor="contact-message" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    placeholder="How can we help your society or answer your questions? Please provide brief details..."
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: '' });
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-lg border ${
                      errors.message
                        ? 'border-red-500 dark:border-red-600 focus:ring-red-500/20'
                        : 'border-neutral-300 dark:border-[#2a3547] focus:border-primary-600 focus:ring-primary-600/30'
                    } bg-white dark:bg-[#1a2232] text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 transition`}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[44px] w-full py-3 px-6 rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Sending Message…
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
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
