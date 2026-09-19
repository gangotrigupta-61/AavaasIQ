import Link from 'next/link';
import { Building2 } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Services', href: '/#services' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Updates', href: '/#updates' },
  ],
  Company: [
    { label: 'About', href: '/#about' },
    { label: 'Careers', href: '/#about' },
    { label: 'Blog', href: '/#about' },
    { label: 'Contact', href: '/#contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Cookie Policy', href: '#cookies' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-neutral-900 dark:bg-[#07090e] text-neutral-400 border-t border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">AavaasIQ</span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Smarter Societies. Better Living.
            </p>
            <p className="text-xs text-neutral-500 mt-3 leading-relaxed max-w-xs">
              An intelligent digital platform that makes residential community management simpler, safer and more connected.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white text-sm font-semibold mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-neutral-500">
            © 2025 AavaasIQ. All rights reserved.
          </p>
          <p className="text-xs text-neutral-600">
            Built for modern Indian residential communities.
          </p>
        </div>
      </div>
    </footer>
  );
}
