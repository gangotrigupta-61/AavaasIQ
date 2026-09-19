'use server';

import { createClient } from '@/lib/supabase/server';
import { EmergencyContact } from '@/lib/types';
import { DbEmergencyContact } from '@/lib/supabase/types';

export interface EmergencyActionResult {
  success?: boolean;
  error?: string;
  contacts?: EmergencyContact[];
  grouped?: Record<string, EmergencyContact[]>;
}

export async function getEmergencyContacts(): Promise<EmergencyActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return { error: 'Authentication required. Please sign in.' };
  }

  // Find society of the caller
  const { data: membership } = await supabase
    .from('society_memberships')
    .select('society_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  let societyId = membership?.society_id;

  if (!societyId) {
    // Check if provider
    const { data: provider } = await supabase
      .from('service_providers')
      .select('society_id')
      .eq('user_id', user.id)
      .maybeSingle();
    societyId = provider?.society_id;
  }

  // Query emergency contacts from Supabase
  let query = supabase
    .from('emergency_contacts')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (societyId) {
    query = query.eq('society_id', societyId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[getEmergencyContacts] error:', error);
    return { error: error.message };
  }

  const contacts: EmergencyContact[] = (data as DbEmergencyContact[] || []).map((c) => ({
    id: c.id,
    societyId: c.society_id,
    name: c.name,
    category: c.category,
    phone: c.phone,
    availableHours: c.available_hours,
    description: c.description,
    isActive: c.is_active,
  }));

  // Group by category
  const grouped: Record<string, EmergencyContact[]> = {};
  contacts.forEach((c) => {
    if (!grouped[c.category]) {
      grouped[c.category] = [];
    }
    grouped[c.category].push(c);
  });

  return {
    success: true,
    contacts,
    grouped,
  };
}
