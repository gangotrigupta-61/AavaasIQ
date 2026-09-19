'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Phone, AlertTriangle, ShieldAlert, Flame, Heart, Zap, Wrench, Radio, Loader2 } from 'lucide-react';
import { getEmergencyContacts } from '@/app/actions/emergency';
import { EmergencyContact } from '@/lib/types';

function getCategoryConfig(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes('medical')) {
    return { icon: <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />, bg: 'bg-red-50 dark:bg-red-950/40' };
  }
  if (cat.includes('fire')) {
    return { icon: <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />, bg: 'bg-orange-50 dark:bg-orange-950/40' };
  }
  if (cat.includes('police')) {
    return { icon: <ShieldAlert className="w-5 h-5 text-blue-600 dark:text-blue-400" />, bg: 'bg-blue-50 dark:bg-blue-950/40' };
  }
  if (cat.includes('util')) {
    return { icon: <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-50 dark:bg-amber-950/40' };
  }
  if (cat.includes('maintenance')) {
    return { icon: <Wrench className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />, bg: 'bg-neutral-100 dark:bg-neutral-800/60' };
  }
  if (cat.includes('security') || cat.includes('society')) {
    return { icon: <Radio className="w-5 h-5 text-primary-600 dark:text-primary-400" />, bg: 'bg-primary-50 dark:bg-primary-950/40' };
  }
  return { icon: <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />, bg: 'bg-red-50 dark:bg-red-950/40' };
}

export default function ResidentEmergencyPage() {
  const [grouped, setGrouped] = useState<Record<string, EmergencyContact[]>>({});
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      setLoading(true);
      const res = await getEmergencyContacts();
      if (res.grouped) {
        setGrouped(res.grouped);
      }
      setLoading(false);
    });
  }, []);

  const categoryKeys = Object.keys(grouped);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Emergency Contacts</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Important emergency numbers for your society.</p>
      </div>

      {/* Emergency alert bar */}
      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
        <p className="text-sm font-medium text-red-800 dark:text-red-300">
          In a life-threatening emergency, always call <strong>112</strong> (National Emergency) first.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <p className="text-sm">Loading emergency directory...</p>
        </div>
      ) : categoryKeys.length === 0 ? (
        <Card padding="md">
          <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 py-8">
            No emergency contacts listed for this society yet. Please call 112 for any emergency.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {categoryKeys.map((catName) => {
            const config = getCategoryConfig(catName);
            const contacts = grouped[catName];
            return (
              <Card key={catName} padding="none">
                <div className={`px-5 py-3 ${config.bg} rounded-t-xl border-b border-neutral-100 dark:border-[#222b3d] flex items-center gap-2`}>
                  {config.icon}
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{catName}</h3>
                </div>
                <ul className="divide-y divide-neutral-50 dark:divide-[#222b3d]">
                  {contacts.map((c) => (
                    <li key={c.id} className="flex items-center justify-between px-5 py-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{c.name}</p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                          {c.availableHours}
                          {c.description ? ` · ${c.description}` : ''}
                        </p>
                      </div>
                      <a
                        href={`tel:${c.phone.replace(/[-\s]/g, '')}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1a2232] border border-neutral-200 dark:border-[#2a3547] rounded-lg text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#222b3d] hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors shrink-0"
                      >
                        <Phone className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
                        {c.phone}
                      </a>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center pb-2">
        Contact the society office to update or add emergency contacts.
      </p>
    </div>
  );
}
