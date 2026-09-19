'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Delivery } from '@/lib/types';
import { DbDelivery, DeliveryStatus } from '@/lib/supabase/types';

export interface DeliveryActionResult {
  success?: boolean;
  error?: string;
  delivery?: Delivery;
  deliveries?: Delivery[];
  residentId?: string;
  isDemo?: boolean;
}

export interface CreateDeliveryInput {
  provider: string;
  flatNo: string;
  block?: string;
  residentName?: string;
  description?: string;
}

type AuthResidentContext =
  | { ok: false; error: string }
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
      user: NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>['auth']['getUser']>>['data']['user']>;
      profile: { id: string; full_name: string | null; role: string };
      membership: { society_id: string; flat_number: string | null; block: string | null; status: string };
      flatDisplay: string;
    };

type AuthStaffContext =
  | { ok: false; error: string }
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
      user: NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>['auth']['getUser']>>['data']['user']>;
      profile: { id: string; full_name: string | null; role: string };
      societyId: string;
    };

async function getAuthResidentContext(): Promise<AuthResidentContext> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: 'Authentication required. Please sign in.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { ok: false, error: 'User profile not found.' };
  }

  const { data: membership, error: membershipError } = await supabase
    .from('society_memberships')
    .select('society_id, flat_number, block, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (membershipError || !membership) {
    return {
      ok: false,
      error: 'No active society membership found. Please contact your administrator.',
    };
  }

  return {
    ok: true,
    supabase,
    user,
    profile,
    membership,
    flatDisplay: membership.flat_number
      ? (membership.block ? `${membership.block}-${membership.flat_number}` : `${membership.flat_number}`)
      : '',
  };
}

async function getAuthStaffContext(allowedRoles: ('security' | 'admin')[]): Promise<AuthStaffContext> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: 'Authentication required. Please sign in.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !allowedRoles.includes(profile.role as 'security' | 'admin')) {
    return { ok: false, error: 'Unauthorized: Staff access required.' };
  }

  const { data: membership, error: membershipError } = await supabase
    .from('society_memberships')
    .select('society_id, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (membershipError || !membership) {
    return { ok: false, error: 'No active society found for this account.' };
  }

  return {
    ok: true,
    supabase,
    user,
    profile,
    societyId: membership.society_id,
  };
}

function mapDbDeliveryToDelivery(
  db: DbDelivery & { flat_number?: string | null; sender_name?: string | null },
  residentName?: string,
  flatNo?: string
): Delivery {
  const resolvedFlat = db.flat_number || flatNo || 'Flat';
  const resolvedProvider = db.sender_name || db.courier_name || 'Courier';

  return {
    id: db.id,
    residentId: db.resident_id,
    societyId: db.society_id,
    provider: resolvedProvider,
    trackingId: db.tracking_number || `PKG-${db.id.slice(0, 8).toUpperCase()}`,
    description: db.description || 'Package',
    deliveryDate: db.delivery_date ?? undefined,
    arrivedAt: db.received_at ?? db.created_at ?? undefined,
    collectedAt: db.collected_at ?? undefined,
    status: db.status,
    rawStatus: db.status,
    flatNo: resolvedFlat,
    residentName: residentName || 'Resident',
  };
}

// ─── 1. Get My Deliveries (Resident) ──────────────────────────────────────────

export async function getMyDeliveries(): Promise<DeliveryActionResult> {
  const ctx = await getAuthResidentContext();
  if (!ctx.ok) {
    return { error: ctx.error, deliveries: [], isDemo: false };
  }

  const { data, error } = await ctx.supabase
    .from('deliveries')
    .select('*')
    .eq('resident_id', ctx.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getMyDeliveries] query error:', error);
    return { error: error.message, deliveries: [], isDemo: false };
  }

  const deliveries = (data as (DbDelivery & { flat_number?: string | null })[]).map((row) =>
    mapDbDeliveryToDelivery(row, ctx.profile.full_name || 'Resident', row.flat_number || ctx.flatDisplay)
  );

  return { deliveries, residentId: ctx.user.id, isDemo: false };
}

// ─── 2. Confirm Delivery Collection (Resident) ────────────────────────────────

export async function confirmDeliveryCollection(deliveryId: string): Promise<DeliveryActionResult> {
  if (!deliveryId || typeof deliveryId !== 'string') {
    return { error: 'Valid delivery ID is required.' };
  }

  const ctx = await getAuthResidentContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  // Verify the delivery belongs to auth resident
  const { data: existing, error: findError } = await ctx.supabase
    .from('deliveries')
    .select('*')
    .eq('id', deliveryId)
    .eq('resident_id', ctx.user.id)
    .single();

  if (findError || !existing) {
    return { error: 'Delivery not found or does not belong to you.' };
  }

  if (existing.status === 'collected') {
    return { error: 'Delivery has already been marked as collected.' };
  }

  const { data, error } = await ctx.supabase
    .from('deliveries')
    .update({
      status: 'collected',
      collected_at: new Date().toISOString(),
    })
    .eq('id', deliveryId)
    .eq('resident_id', ctx.user.id)
    .select('*')
    .single();

  if (error) {
    console.error('[confirmDeliveryCollection] update error:', error);
    return { error: error.message };
  }

  revalidatePath('/resident/deliveries');
  revalidatePath('/security/deliveries');

  return {
    success: true,
    delivery: mapDbDeliveryToDelivery(data as DbDelivery, ctx.profile.full_name || 'Resident', ctx.flatDisplay),
  };
}

// ─── 3. Get Security Deliveries (Security / Admin) ────────────────────────────

export async function getSecurityDeliveries(): Promise<DeliveryActionResult> {
  const ctx = await getAuthStaffContext(['security', 'admin']);
  if (!ctx.ok) {
    return { error: ctx.error, deliveries: [], isDemo: false };
  }

  const { data, error } = await ctx.supabase
    .from('deliveries')
    .select(`
      *,
      profiles:resident_id (
        full_name,
        society_memberships (flat_number, block)
      )
    `)
    .eq('society_id', ctx.societyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getSecurityDeliveries] query error:', error);
    return { error: error.message };
  }

  interface JoinedDeliveryRow extends DbDelivery {
    flat_number?: string | null;
    sender_name?: string | null;
    profiles?: {
      full_name: string | null;
      society_memberships?: { flat_number: string | null; block: string | null }[] | { flat_number: string | null; block: string | null };
    } | null;
  }
  const deliveries = ((data as unknown as JoinedDeliveryRow[]) || []).map((row) => {
    const prof = row.profiles;
    const mem = Array.isArray(prof?.society_memberships) ? prof.society_memberships[0] : prof?.society_memberships;
    const flatNo = row.flat_number || (mem?.flat_number
      ? (mem.block ? `${mem.block}-${mem.flat_number}` : `${mem.flat_number}`)
      : 'Flat');
    return mapDbDeliveryToDelivery(row, prof?.full_name || 'Resident', flatNo);
  });

  return { deliveries, isDemo: false };
}

// ─── 4. Create Delivery (Security / Admin) ────────────────────────────────────

export async function createDelivery(input: CreateDeliveryInput): Promise<DeliveryActionResult> {
  const provider = input.provider?.trim();
  const flatNoInput = input.flatNo?.trim();
  const blockInput = input.block?.trim();

  if (!provider) return { error: 'Delivery provider is required.' };
  if (!flatNoInput) return { error: 'Flat number is required.' };

  const ctx = await getAuthStaffContext(['security', 'admin']);
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  // Parse and normalize block and flat_number
  let normBlock: string | null = blockInput ? blockInput.toUpperCase() : null;
  let normFlat: string = flatNoInput;

  if (flatNoInput.includes('-')) {
    const parts = flatNoInput.split('-');
    if (!normBlock) normBlock = parts[0].trim().toUpperCase();
    normFlat = parts[1].trim();
  } else if (flatNoInput.includes('/')) {
    const parts = flatNoInput.split('/');
    if (!normBlock) normBlock = parts[0].trim().toUpperCase();
    normFlat = parts[1].trim();
  } else if (!normBlock) {
    const match = flatNoInput.match(/^([a-zA-Z]+)[ -]?([0-9a-zA-Z]+)$/);
    if (match) {
      normBlock = match[1].toUpperCase();
      normFlat = match[2];
    }
  }

  // Resident Lookup
  let targetResidentId: string | null = null;
  let residentName = input.residentName || 'Resident';
  let matchedBlock: string | null = normBlock;
  let matchedFlat: string = normFlat;
  let lookupError: string | null = null;

  // Attempt 1: Try secure RPC function find_society_resident_for_delivery
  // This function requires the phase3_4_delivery_flow_fix.sql migration to be applied.
  try {
    const { data: rpcRows, error: rpcErr } = await ctx.supabase.rpc('find_society_resident_for_delivery', {
      p_block: normBlock || null,
      p_flat_number: normFlat || null,
    });

    if (!rpcErr && rpcRows && rpcRows.length > 0) {
      targetResidentId = rpcRows[0].resident_id;
      if (rpcRows[0].full_name) residentName = rpcRows[0].full_name;
      matchedBlock = rpcRows[0].block || normBlock;
      matchedFlat = rpcRows[0].flat_number || normFlat;
    } else if (rpcErr && rpcErr.code !== 'PGRST202') {
      // Non-PGRST202 RPC error = database problem, not just missing function
      console.error('[createDelivery] RPC error (not missing function):', rpcErr);
      lookupError = rpcErr.message;
    } else if (rpcErr?.code === 'PGRST202') {
      console.warn('[createDelivery] find_society_resident_for_delivery RPC not found in DB — falling back to direct query. Apply phase3_4_delivery_flow_fix.sql migration to fix this.');
    }
  } catch (err) {
    console.warn('[createDelivery] RPC lookup exception:', err);
  }

  // Attempt 2: Direct query on society_memberships if RPC didn't resolve resident
  // This may return empty if the staff RLS policy has not been applied (phase3_4_delivery_flow_fix.sql).
  if (!targetResidentId) {
    try {
      let membershipQuery = ctx.supabase
        .from('society_memberships')
        .select('user_id, flat_number, block, profiles(full_name)')
        .eq('society_id', ctx.societyId)
        .eq('status', 'active');

      if (normBlock) {
        membershipQuery = membershipQuery.ilike('block', normBlock).ilike('flat_number', normFlat);
      } else {
        membershipQuery = membershipQuery.or(`flat_number.ilike.${normFlat},flat_number.ilike.${flatNoInput}`);
      }

      const { data: memberMatches, error: memberError } = await membershipQuery.limit(1);

      if (memberError) {
        // Distinguish RLS-blocked (returns empty + no error) vs actual DB error
        console.error('[createDelivery] direct membership query error:', memberError);
        if (!lookupError) lookupError = memberError.message;
      } else if (memberMatches && memberMatches.length > 0) {
        targetResidentId = memberMatches[0].user_id;
        matchedBlock = memberMatches[0].block || normBlock;
        matchedFlat = memberMatches[0].flat_number || normFlat;
        const prof = memberMatches[0] as unknown as { profiles?: { full_name: string | null } | null };
        if (prof?.profiles?.full_name) {
          residentName = prof.profiles.full_name;
        }
      } else {
        console.warn('[createDelivery] No resident found via direct query. This may be an RLS issue (staff cannot see other members). Apply phase3_4_delivery_flow_fix.sql migration.');
      }
    } catch (err) {
      console.error('[createDelivery] direct membership query exception:', err);
    }
  }

  // Distinguish genuine not-found vs query/database error
  if (!targetResidentId) {
    if (lookupError) {
      return {
        error: 'Unable to verify the resident. Please try again.',
      };
    }
    return {
      error: 'No registered resident found for this flat.',
    };
  }

  const displayFlat = matchedBlock ? `${matchedBlock}-${matchedFlat}` : matchedFlat;
  const trackingNumber = `PKG-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

  // Prepare insert payload
  const insertPayload: Record<string, unknown> = {
    resident_id: targetResidentId,
    society_id: ctx.societyId,
    courier_name: provider,
    sender_name: provider,
    flat_number: displayFlat,
    tracking_number: trackingNumber,
    description: input.description?.trim() || 'Package',
    delivery_date: new Date().toISOString().split('T')[0],
    status: 'expected' as DeliveryStatus,
    received_at: new Date().toISOString(),
  };

  let insertResult = await ctx.supabase
    .from('deliveries')
    .insert(insertPayload)
    .select('*')
    .single();

  // If column error (e.g. sender_name / flat_number not added yet), fallback to core columns
  if (insertResult.error && insertResult.error.message.includes('column')) {
    const fallbackPayload = {
      resident_id: targetResidentId,
      society_id: ctx.societyId,
      courier_name: provider,
      tracking_number: trackingNumber,
      description: input.description?.trim() || 'Package',
      delivery_date: new Date().toISOString().split('T')[0],
      status: 'expected' as DeliveryStatus,
      received_at: new Date().toISOString(),
    };

    insertResult = await ctx.supabase
      .from('deliveries')
      .insert(fallbackPayload)
      .select('*')
      .single();
  }

  if (insertResult.error) {
    console.error('[createDelivery] insert error:', insertResult.error);
    return { error: 'Unable to save delivery. Please try again.' };
  }

  revalidatePath('/security/deliveries');
  revalidatePath('/resident/deliveries');

  return {
    success: true,
    delivery: mapDbDeliveryToDelivery(insertResult.data as DbDelivery, residentName, displayFlat),
  };
}

// ─── 5. Update Delivery Status (Security / Admin) ─────────────────────────────

export async function updateDeliveryStatus(
  deliveryId: string,
  newStatus: DeliveryStatus
): Promise<DeliveryActionResult> {
  if (!deliveryId || typeof deliveryId !== 'string') {
    return { error: 'Valid delivery ID is required.' };
  }

  const validStatuses: DeliveryStatus[] = ['expected', 'received', 'collected', 'returned'];
  if (!validStatuses.includes(newStatus)) {
    return { error: 'Invalid delivery status.' };
  }

  const ctx = await getAuthStaffContext(['security', 'admin']);
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const updateData: Partial<DbDelivery> = {
    status: newStatus,
  };

  if (newStatus === 'received') {
    updateData.received_at = new Date().toISOString();
  } else if (newStatus === 'collected') {
    updateData.collected_at = new Date().toISOString();
  }

  const { data, error } = await ctx.supabase
    .from('deliveries')
    .update(updateData)
    .eq('id', deliveryId)
    .eq('society_id', ctx.societyId)
    .select('*')
    .single();

  if (error) {
    console.error('[updateDeliveryStatus] update error:', error);
    return { error: error.message };
  }

  revalidatePath('/security/deliveries');
  revalidatePath('/resident/deliveries');

  return {
    success: true,
    delivery: mapDbDeliveryToDelivery(data as DbDelivery),
  };
}
