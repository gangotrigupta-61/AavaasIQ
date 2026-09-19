'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { MaintenanceBill, MaintenanceRecord, MaintenanceStatus } from '@/lib/types';
import { DbMaintenanceRecord } from '@/lib/supabase/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MaintenanceActionResult {
  success?: boolean;
  error?: string;
  record?: MaintenanceRecord;
  records?: MaintenanceRecord[];
  bills?: MaintenanceBill[];
  isDemo?: boolean;
  paymentReference?: string;
  paidAt?: string;
}

export interface CreateMaintenanceInput {
  residentId: string;
  title: string;
  amount: number;
  dueDate: string;
}

// ─── Helper: Get Current User & Profile & Society ─────────────────────────────

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

type AuthAdminContext =
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
    return { ok: false, error: 'No active society membership found.' };
  }

  return {
    ok: true,
    supabase,
    user,
    profile,
    membership,
    flatDisplay: membership.flat_number
      ? (membership.block ? `Flat ${membership.block}-${membership.flat_number}` : `Flat ${membership.flat_number}`)
      : 'Not assigned',
  };
}

async function getAuthAdminContext(): Promise<AuthAdminContext> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: 'Authentication required. Please sign in as an administrator.' };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return { ok: false, error: 'Unauthorized: Administrator access required.' };
  }

  const { data: membership, error: membershipError } = await supabase
    .from('society_memberships')
    .select('society_id, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (membershipError || !membership) {
    return { ok: false, error: 'No active society found for this administrator account.' };
  }

  return {
    ok: true,
    supabase,
    user,
    profile,
    societyId: membership.society_id,
  };
}

// ─── 1. Get My Maintenance (Resident) ─────────────────────────────────────────

export async function getMyMaintenance(): Promise<MaintenanceActionResult> {
  const ctx = await getAuthResidentContext();
  if (!ctx.ok) {
    return { error: ctx.error, bills: [], records: [], isDemo: false };
  }
  const { supabase, user, profile, flatDisplay } = ctx;

  const { data, error } = await supabase
    .from('maintenance_records')
    .select('*')
    .eq('resident_id', user.id)
    .order('due_date', { ascending: false });

  if (error) {
    console.error('[getMyMaintenance] DB query error:', error);
    return { error: error.message, bills: [], records: [], isDemo: false };
  }

  const rows = (data || []) as DbMaintenanceRecord[];

  const records: MaintenanceRecord[] = rows.map((r) => ({
    id: r.id,
    residentId: r.resident_id,
    societyId: r.society_id,
    residentName: profile.full_name || 'Resident',
    flat: flatDisplay || 'Not assigned',
    title: r.title,
    amount: Number(r.amount),
    dueDate: r.due_date || '',
    paidAt: r.paid_at || undefined,
    status: r.status,
    paymentReference: r.payment_reference || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  const bills: MaintenanceBill[] = rows.map((r) => ({
    id: r.id,
    residentId: r.resident_id,
    societyId: r.society_id,
    month: r.title,
    amount: Number(r.amount),
    dueDate: r.due_date || '',
    paidDate: r.paid_at || undefined,
    status: r.status,
    paymentReference: r.payment_reference || undefined,
    createdAt: r.created_at,
  }));

  return { records, bills, isDemo: false };
}

// ─── 2. Simulate Maintenance Payment (Resident) ───────────────────────────────

export async function simulateMaintenancePayment(
  recordId: string
): Promise<MaintenanceActionResult> {
  if (!recordId || typeof recordId !== 'string') {
    return { error: 'Valid maintenance record ID is required.' };
  }

  const ctx = await getAuthResidentContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }
  const { supabase, user } = ctx;

  // Generate a simulated transaction reference (UPI format)
  const paymentRef = `UPI-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Attempt 1: Call SECURITY DEFINER function record_simulated_payment
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'record_simulated_payment',
    {
      p_record_id: recordId,
      p_payment_ref: paymentRef,
    }
  );

  if (!rpcError && rpcData?.success) {
    revalidatePath('/resident/maintenance');
    revalidatePath('/resident/dashboard');
    revalidatePath('/admin/maintenance');
    const now = new Date().toISOString();
    return { success: true, paymentReference: paymentRef, paidAt: now };
  }

  // Attempt 2: Direct UPDATE fallback (enforced by RLS)
  const { data: existing, error: findError } = await supabase
    .from('maintenance_records')
    .select('id, resident_id, status')
    .eq('id', recordId)
    .single();

  if (findError || !existing) {
    return { error: 'Maintenance record not found.' };
  }

  if (existing.resident_id !== user.id) {
    return { error: 'Unauthorized: This bill belongs to another resident.' };
  }

  if (existing.status === 'paid') {
    return { error: 'This bill has already been paid.' };
  }

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('maintenance_records')
    .update({
      status: 'paid',
      paid_at: now,
      payment_reference: paymentRef,
    })
    .eq('id', recordId)
    .eq('resident_id', user.id);

  if (updateError) {
    console.error('[simulateMaintenancePayment] update error:', updateError);
    return { error: `Payment simulation failed: ${updateError.message}` };
  }

  revalidatePath('/resident/maintenance');
  revalidatePath('/resident/dashboard');
  revalidatePath('/admin/maintenance');

  return { success: true, paymentReference: paymentRef, paidAt: now };
}

// ─── 3. Get Admin Maintenance (Admin Only) ────────────────────────────────────

export async function getAdminMaintenance(): Promise<MaintenanceActionResult> {
  const ctx = await getAuthAdminContext();
  if (!ctx.ok) {
    return { error: ctx.error, records: [], bills: [], isDemo: false };
  }
  const { supabase, societyId } = ctx;

  const { data, error } = await supabase
    .from('maintenance_records')
    .select(`
      *,
      resident:profiles!resident_id(full_name)
    `)
    .eq('society_id', societyId)
    .order('due_date', { ascending: false });

  if (error) {
    console.error('[getAdminMaintenance] DB query error:', error);
    return { error: error.message, records: [], bills: [], isDemo: false };
  }

  const rows = data || [];

  // Fetch flat and block for all residents
  const residentIds = Array.from(new Set(rows.map((r: { resident_id: string }) => r.resident_id)));
  const flatMap: Record<string, { flat: string; block: string }> = {};

  if (residentIds.length > 0) {
    const { data: members } = await supabase
      .from('society_memberships')
      .select('user_id, flat_number, block')
      .eq('society_id', societyId)
      .in('user_id', residentIds);

    if (members) {
      for (const m of members) {
        flatMap[m.user_id] = {
          flat: m.flat_number || '—',
          block: m.block || '—',
        };
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const records: MaintenanceRecord[] = rows.map((r: any) => ({
    id: r.id,
    residentId: r.resident_id,
    societyId: r.society_id,
    residentName: r.resident?.full_name || 'Resident',
    flat: flatMap[r.resident_id]?.flat || '—',
    block: flatMap[r.resident_id]?.block || '—',
    title: r.title,
    amount: Number(r.amount),
    dueDate: r.due_date || '',
    status: r.status as MaintenanceStatus,
    paymentReference: r.payment_reference,
    paidAt: r.paid_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  const bills: MaintenanceBill[] = records.map((r) => ({
    id: r.id,
    residentId: r.residentId,
    societyId: r.societyId,
    month: r.title,
    amount: r.amount,
    dueDate: r.dueDate,
    paidDate: r.paidAt || undefined,
    status: r.status,
    paymentReference: r.paymentReference,
  }));

  return { records, bills, isDemo: false };
}

// ─── 4. Create Maintenance Record (Admin Only) ────────────────────────────────

export async function createMaintenanceRecord(
  input: CreateMaintenanceInput
): Promise<MaintenanceActionResult> {
  const ctx = await getAuthAdminContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }
  const { supabase, societyId } = ctx;

  const residentId = input.residentId?.trim();
  const title = input.title?.trim();
  const amount = Number(input.amount);
  const dueDate = input.dueDate?.trim();

  if (!residentId) return { error: 'Resident ID is required.' };
  if (!title) return { error: 'Bill title / month is required.' };
  if (isNaN(amount) || amount <= 0) return { error: 'Valid amount is required.' };
  if (!dueDate) return { error: 'Due date is required.' };

  const { data, error } = await supabase
    .from('maintenance_records')
    .insert({
      resident_id: residentId,
      society_id: societyId,
      title,
      amount,
      due_date: dueDate,
      status: 'pending',
    })
    .select()
    .single();

  if (error || !data) {
    console.error('[createMaintenanceRecord] DB insert error:', error);
    return { error: `Failed to create maintenance record: ${error?.message || 'Database error'}` };
  }

  revalidatePath('/admin/maintenance');
  revalidatePath('/resident/maintenance');
  revalidatePath('/resident/dashboard');

  return { success: true };
}

// ─── 5. Update Maintenance Record (Admin Only) ────────────────────────────────

export async function updateMaintenanceRecord(
  recordId: string,
  updates: Partial<Pick<DbMaintenanceRecord, 'title' | 'amount' | 'due_date' | 'status'>>
): Promise<MaintenanceActionResult> {
  const ctx = await getAuthAdminContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }
  const { supabase, societyId } = ctx;

  // Verify record belongs to this society
  const { data: existing, error: findError } = await supabase
    .from('maintenance_records')
    .select('id, society_id')
    .eq('id', recordId)
    .single();

  if (findError || !existing) {
    return { error: 'Maintenance record not found.' };
  }

  if (existing.society_id !== societyId) {
    return { error: 'Unauthorized: Record belongs to a different society.' };
  }

  const { error: updateError } = await supabase
    .from('maintenance_records')
    .update(updates)
    .eq('id', recordId);

  if (updateError) {
    console.error('[updateMaintenanceRecord] update error:', updateError);
    return { error: `Failed to update record: ${updateError.message}` };
  }

  revalidatePath('/admin/maintenance');
  revalidatePath('/resident/maintenance');

  return { success: true };
}
