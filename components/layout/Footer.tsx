import Link from 'next/link';
import { Building2 } from 'lucide-react';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/features' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Roles', href: '/roles' },
    { label: 'Services', href: '/services' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Platform Tour', href: '/how-it-works' },
    { label: 'Security & Safety', href: '/about' },
  ],
  Portals: [
    { label: 'Resident Portal', href: '/login' },
    { label: 'Management Admin', href: '/login' },
    { label: 'Security Desk', href: '/login' },
    { label: 'Service Provider', href: '/login' },
  ],
};

export default function Footer() {
  return (
    <footer className="w-full bg-neutral-900 dark:bg-[#07090e] text-neutral-400 border-t border-neutral-800 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-12 sm:pb-12 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg tracking-tight">AavaasIQ</span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Smarter Societies. Better Living.
            </p>
            <p className="text-xs text-neutral-500 mt-3 leading-relaxed max-w-xs break-words">
              An intelligent digital platform that makes residential community management simpler, safer and more connected.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="w-full">
              <h3 className="text-white text-sm font-semibold mb-3 sm:mb-4">{title}</h3>
              <ul className="space-y-3 md:space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="inline-block py-1 sm:py-0.5 md:py-0 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
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
        <div className="mt-10 sm:mt-12 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
          <p className="text-xs text-neutral-500">
            © 2025 AavaasIQ. All rights reserved.
          </p>
          <p className="text-xs text-neutral-600 sm:text-right">
            Built for modern Indian residential communities.
          </p>
        </div>
      </div>
    </footer>
  );
}
