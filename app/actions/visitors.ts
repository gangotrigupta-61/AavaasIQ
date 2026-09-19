'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Visitor } from '@/lib/types';
import { DbVisitor, VisitorStatus } from '@/lib/supabase/types';

export interface VisitorActionResult {
  success?: boolean;
  error?: string;
  visitor?: Visitor;
  visitors?: Visitor[];
  residentId?: string;
  societyId?: string;
  isDemo?: boolean;
}

export interface CreateVisitorInput {
  name: string;
  purpose?: string;
  phone?: string;
  date?: string;
  time?: string;
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

function mapDbVisitorToVisitor(
  db: DbVisitor,
  residentName = 'Resident',
  flatNo = ''
): Visitor {
  return {
    id: db.id,
    residentId: db.resident_id,
    societyId: db.society_id,
    name: db.visitor_name,
    purpose: (db.purpose as Visitor['purpose']) || 'guest',
    flatNo,
    residentName,
    visitDate: db.visit_date ?? undefined,
    expectedAt: db.expected_arrival ?? undefined,
    arrivedAt: db.arrived_at ?? undefined,
    exitedAt: db.exited_at ?? undefined,
    status: db.status,
    phone: db.visitor_phone ?? undefined,
    passCode: db.pass_code ?? undefined,
  };
}

// --- 1. Get My Visitors (Resident) --------------------------------------------

export async function getMyVisitors(): Promise<VisitorActionResult> {
  const ctx = await getAuthResidentContext();
  if (!ctx.ok) {
    return { error: ctx.error, visitors: [], isDemo: false };
  }

  const { data, error } = await ctx.supabase
    .from('visitors')
    .select('*')
    .eq('resident_id', ctx.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getMyVisitors] query error:', error);
    return { error: error.message, visitors: [], isDemo: false };
  }

  const visitors = (data as DbVisitor[]).map((row) =>
    mapDbVisitorToVisitor(row, ctx.profile.full_name || 'Resident', ctx.flatDisplay)
  );

  return { visitors, residentId: ctx.user.id, societyId: ctx.membership.society_id, isDemo: false };
}

// --- 2. Create Visitor (Resident) ---------------------------------------------

export async function createVisitor(input: CreateVisitorInput): Promise<VisitorActionResult> {
  const name = input.name?.trim();
  if (!name || name.length < 2 || name.length > 100) {
    return { error: 'Visitor name must be between 2 and 100 characters.' };
  }

  const validPurposes: Visitor['purpose'][] = ['guest', 'delivery', 'service', 'cab', 'other'];
  const purpose = (input.purpose || 'guest') as Visitor['purpose'];
  if (!validPurposes.includes(purpose)) {
    return { error: 'Invalid visitor purpose.' };
  }

  const phone = input.phone?.trim();
  if (phone && !/^[0-9+\s\-()]{7,20}$/.test(phone)) {
    return { error: 'Invalid phone number format.' };
  }

  const ctx = await getAuthResidentContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  let expectedArrival: string | null = null;
  if (input.date) {
    const timeStr = input.time || '12:00';
    const parsedDate = new Date(`${input.date}T${timeStr}:00`);
    if (isNaN(parsedDate.getTime())) {
      return { error: 'Invalid date/time provided.' };
    }
    expectedArrival = parsedDate.toISOString();
  }

  const insertPayload = {
    resident_id: ctx.user.id,
    society_id: ctx.membership.society_id,
    visitor_name: name,
    visitor_phone: phone || null,
    purpose,
    visit_date: input.date || new Date().toISOString().split('T')[0],
    expected_arrival: expectedArrival,
    pass_code: Math.floor(1000 + Math.random() * 9000).toString(),
    status: 'expected' as VisitorStatus,
  };

  const { data, error } = await ctx.supabase
    .from('visitors')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    console.error('[createVisitor] insert error:', error);
    return { error: error.message };
  }

  revalidatePath('/resident/visitors');
  revalidatePath('/security/visitors');
  revalidatePath('/admin/visitors');

  return {
    success: true,
    visitor: mapDbVisitorToVisitor(data as DbVisitor, ctx.profile.full_name || 'Resident', ctx.flatDisplay),
  };
}

// --- 3. Update Visitor Status (Security / Admin) ------------------------------

export async function updateVisitorStatus(
  visitorId: string,
  newStatus: VisitorStatus
): Promise<VisitorActionResult> {
  if (!visitorId || typeof visitorId !== 'string') {
    return { error: 'Valid visitor ID is required.' };
  }

  const validStatuses: VisitorStatus[] = ['expected', 'approved', 'inside', 'exited', 'rejected'];
  if (!validStatuses.includes(newStatus)) {
    return { error: 'Invalid visitor status.' };
  }

  const ctx = await getAuthStaffContext(['security', 'admin']);
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const updateData: Partial<DbVisitor> = {
    status: newStatus,
  };

  if (newStatus === 'inside') {
    updateData.arrived_at = new Date().toISOString();
  } else if (newStatus === 'exited') {
    updateData.exited_at = new Date().toISOString();
  }

  const { data, error } = await ctx.supabase
    .from('visitors')
    .update(updateData)
    .eq('id', visitorId)
    .eq('society_id', ctx.societyId)
    .select('*')
    .single();

  if (error) {
    console.error('[updateVisitorStatus] update error:', error);
    return { error: error.message };
  }

  revalidatePath('/resident/visitors');
  revalidatePath('/security/visitors');
  revalidatePath('/admin/visitors');

  return {
    success: true,
    visitor: mapDbVisitorToVisitor(data as DbVisitor),
  };
}

// --- 4. Get Security Visitors -------------------------------------------------

export async function getSecurityVisitors(): Promise<VisitorActionResult> {
  const ctx = await getAuthStaffContext(['security', 'admin']);
  if (!ctx.ok) {
    return { error: ctx.error, visitors: [], isDemo: false };
  }

  const { data, error } = await ctx.supabase
    .from('visitors')
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
    console.error('[getSecurityVisitors] query error:', error);
    return { error: error.message, visitors: [], isDemo: false };
  }

  interface JoinedVisitorRow extends DbVisitor {
    profiles?: {
      full_name: string | null;
      society_memberships?: { flat_number: string | null; block: string | null }[] | { flat_number: string | null; block: string | null };
    } | null;
  }
  const visitors = ((data as unknown as JoinedVisitorRow[]) || []).map((row) => {
    const prof = row.profiles;
    const mem = Array.isArray(prof?.society_memberships) ? prof.society_memberships[0] : prof?.society_memberships;
    const flatNo = mem?.flat_number
      ? (mem.block ? `${mem.block}-${mem.flat_number}` : `${mem.flat_number}`)
      : 'Flat';
    return mapDbVisitorToVisitor(row as DbVisitor, prof?.full_name || 'Resident', flatNo);
  });

  return { visitors, societyId: ctx.societyId, isDemo: false };
}

// --- 5. Get Admin Visitors ----------------------------------------------------

export async function getAdminVisitors(): Promise<VisitorActionResult> {
  const ctx = await getAuthStaffContext(['admin']);
  if (!ctx.ok) {
    return { error: ctx.error, visitors: [], isDemo: false };
  }

  const { data, error } = await ctx.supabase
    .from('visitors')
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
    console.error('[getAdminVisitors] query error:', error);
    return { error: error.message, visitors: [], isDemo: false };
  }

  interface AdminJoinedVisitorRow extends DbVisitor {
    profiles?: {
      full_name: string | null;
      society_memberships?: { flat_number: string | null; block: string | null }[] | { flat_number: string | null; block: string | null };
    } | null;
  }
  const visitors = ((data as unknown as AdminJoinedVisitorRow[]) || []).map((row) => {
    const prof = row.profiles;
    const mem = Array.isArray(prof?.society_memberships) ? prof.society_memberships[0] : prof?.society_memberships;
    const flatNo = mem?.flat_number
      ? (mem.block ? `${mem.block}-${mem.flat_number}` : `${mem.flat_number}`)
      : 'Flat';
    return mapDbVisitorToVisitor(row as DbVisitor, prof?.full_name || 'Resident', flatNo);
  });

  return { visitors, isDemo: false };
}
