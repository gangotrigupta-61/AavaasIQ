import Link from 'next/link';
import { LucideIcon, ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  backHref: string;
  backLabel?: string;
}

export default function PlaceholderPage({
  title,
  description,
  icon: Icon,
  backHref,
  backLabel = 'Back to Dashboard',
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-16">
      <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-neutral-400" />
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h1>
      <p className="text-neutral-500 text-sm text-center max-w-sm mb-2">{description}</p>
      <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1 rounded-full border border-amber-200 mb-8">
        Coming in Phase 2
      </span>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        {backLabel}
      </Link>
    </div>
  );
}
