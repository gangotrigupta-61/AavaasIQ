'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { Phone, ShieldAlert, Flame, Heart, Zap, Radio, AlertTriangle, Loader2 } from 'lucide-react';
import { getEmergencyContacts } from '@/app/actions/emergency';
import { EmergencyContact } from '@/lib/types';

function getCategoryConfig(category: string) {
  const cat = category.toLowerCase();
  if (cat.includes('medical')) {
    return { icon: <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />, bg: 'bg-rose-50 dark:bg-rose-950/40' };
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
  if (cat.includes('security') || cat.includes('society')) {
    return { icon: <Radio className="w-5 h-5 text-primary-600 dark:text-primary-400" />, bg: 'bg-primary-50 dark:bg-primary-950/40' };
  }
  return { icon: <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />, bg: 'bg-red-50 dark:bg-red-950/40' };
}

const SOP_STEPS = [
  { step: '1', title: 'Assess the situation',        detail: 'Stay calm. Determine if it is a fire, medical, security or structural emergency.' },
  { step: '2', title: 'Alert via intercom',           detail: 'Call Security Control Room (020-2700-0099) immediately with your name, location and nature of emergency.' },
  { step: '3', title: 'Call emergency services',      detail: 'Dial 112 for life-threatening situations. Do not wait for confirmation from security.' },
  { step: '4', title: 'Evacuate if needed',           detail: 'Use emergency stairwells. Do not use lifts. Assemble at Block A main gate muster point.' },
  { step: '5', title: 'Block all unauthorised entry', detail: 'Lock Gate 2. No vehicles enter or exit until clearance from supervisor.' },
  { step: '6', title: 'Document the incident',        detail: 'Record time, nature of emergency, persons involved, and services called in the incident log.' },
];

export default function SecurityEmergencyPage() {
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Emergency Protocols</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Quick reference for security personnel · Green Valley Residency</p>
      </div>

      {/* Alert bar */}
      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3">
        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
        <p className="text-sm font-bold text-red-800 dark:text-red-300">
          Life-threatening emergency? Call <span className="text-2xl">112</span> immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SOP */}
        <div>
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3">Standard Operating Procedure</h3>
          <div className="space-y-2">
            {SOP_STEPS.map((s) => (
              <div key={s.step} className="flex gap-3 bg-white dark:bg-[#131924] border border-neutral-200 dark:border-[#222b3d] rounded-xl p-4">
                <div className="w-7 h-7 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{s.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Groups */}
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              <p className="text-sm">Loading security contacts...</p>
            </div>
          ) : categoryKeys.length === 0 ? (
            <Card padding="md">
              <p className="text-center text-sm text-neutral-400 dark:text-neutral-500 py-8">
                No contacts configured in database yet. Dial 112 for all emergencies.
              </p>
            </Card>
          ) : (
            categoryKeys.map((catName) => {
              const config = getCategoryConfig(catName);
              const contacts = grouped[catName];
              return (
                <Card key={catName} padding="none">
                  <div className={`px-4 py-3 ${config.bg} rounded-t-xl border-b border-neutral-100 dark:border-[#222b3d] flex items-center gap-2`}>
                    {config.icon}
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{catName}</h3>
                  </div>
                  <ul className="divide-y divide-neutral-50 dark:divide-[#222b3d]">
                    {contacts.map((c) => (
                      <li key={c.id} className="flex items-center justify-between px-4 py-3 gap-3">
                        <div>
                          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{c.name}</p>
                          <p className="text-xs text-neutral-400 dark:text-neutral-500">{c.description || c.availableHours}</p>
                        </div>
                        <a
                          href={`tel:${c.phone.replace(/[-\s]/g, '')}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#1a2232] border border-neutral-200 dark:border-[#2a3547] rounded-lg text-sm font-bold text-neutral-800 dark:text-neutral-200 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800 hover:text-red-700 dark:hover:text-red-400 transition-colors shrink-0"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {c.phone}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center pb-2">
        Update emergency contacts by contacting the Society Manager · Last updated: Sep 2026
      </p>
    </div>
  );
}
