'use client';

import { useState } from 'react';
import { AIInsightCard } from '@/components/dashboard/AIInsightCard';
import { AavaasIQAssistant, type AssistantRole } from '@/components/dashboard/AavaasIQAssistant';

interface AssistantInsightCardProps {
  role: AssistantRole;
  title?: string;
  insights: string[];
  actionLabel?: string;
}

/** Client wrapper that wires AIInsightCard → AavaasIQAssistant modal. */
export function AssistantInsightCard({
  role,
  title = 'AavaasIQ Assistant',
  insights,
  actionLabel = 'Ask AavaasIQ',
}: AssistantInsightCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AIInsightCard
        title={title}
        insights={insights}
        actionLabel={actionLabel}
        onAction={() => setOpen(true)}
      />
      <AavaasIQAssistant
        isOpen={open}
        onClose={() => setOpen(false)}
        role={role}
      />
    </>
  );
}
