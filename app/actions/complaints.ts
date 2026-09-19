'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Complaint, ComplaintStatus, ComplaintPriority } from '@/lib/types';
import { DbComplaint } from '@/lib/supabase/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComplaintActionResult {
  success?: boolean;
  error?: string;
  complaint?: Complaint;
  complaints?: Complaint[];
  societyId?: string;
  residentId?: string;
  isDemo?: boolean;
}

export interface CreateComplaintInput {
  title: string;
  category: string;
  description: string;
  priority: ComplaintPriority;
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

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return { ok: false, error: 'User profile not found.' };
  }

  // Fetch active society membership
  const { data: membership, error: membershipError } = await supabase
    .from('society_memberships')
    .select('society_id, flat_number, block, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (membershipError || !membership) {
    return {
      ok: false,
      error: 'No active society membership found. Please contact your society administrator.',
    };
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

  // Fetch profile to verify admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    return { ok: false, error: 'Unauthorized: Administrator access required.' };
  }

  // Fetch admin's active society membership
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

// ─── 1. Create Complaint (Resident) ───────────────────────────────────────────

export async function createComplaint(input: CreateComplaintInput): Promise<ComplaintActionResult> {
  const title = input.title?.trim();
  const category = input.category?.trim();
  const description = input.description?.trim();
  const priority = input.priority || 'medium';

  if (!title || title.length < 3 || title.length > 200) {
    return { error: 'Title must be between 3 and 200 characters.' };
  }
  const validCategories = ['plumbing', 'electrical', 'lift', 'garbage', 'parking', 'noise', 'security', 'maintenance', 'other'];
  if (!category || !validCategories.includes(category.toLowerCase())) {
    return { error: 'Please select a valid complaint category.' };
  }
  if (!description || description.length < 5 || description.length > 2000) {
    return { error: 'Description must be between 5 and 2000 characters.' };
  }
  const validPriorities: ComplaintPriority[] = ['low', 'medium', 'high', 'urgent'];
  if (priority && !validPriorities.includes(priority)) {
    return { error: 'Invalid priority value.' };
  }

  const ctx = await getAuthResidentContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }
  const { supabase, user, profile, membership, flatDisplay } = ctx;

  const insertPayload = {
    resident_id: user.id,
    society_id: membership.society_id,
    category: category.toLowerCase(),
    title,
    description,
    priority,
    status: 'open' as ComplaintStatus,
  };

  const { data, error } = await supabase
    .from('complaints')
    .insert(insertPayload)
    .select()
    .single();

  if (error || !data) {
    console.error('[createComplaint] DB insert error:', error);
    return { error: `Failed to create complaint: ${error?.message || 'Database error'}` };
  }

  const dbRow = data as DbComplaint;
  const newComplaint: Complaint = {
    id: dbRow.id,
    title: dbRow.title,
    description: dbRow.description || '',
    category: dbRow.category,
    status: dbRow.status,
    priority: dbRow.priority,
    residentId: dbRow.resident_id,
    residentName: profile.full_name || 'Resident',
    flat: flatDisplay || 'Not assigned',
    societyId: dbRow.society_id,
    assignedTo: dbRow.assigned_to,
    createdAt: dbRow.created_at,
    updatedAt: dbRow.updated_at,
    resolvedAt: dbRow.resolved_at,
  };

  revalidatePath('/resident/complaints');
  revalidatePath('/resident/dashboard');
  revalidatePath('/admin/complaints');

  return { success: true, complaint: newComplaint };
}

// ─── 2. Get My Complaints (Resident) ──────────────────────────────────────────

export async function getMyComplaints(): Promise<ComplaintActionResult> {
  const ctx = await getAuthResidentContext();
  if (!ctx.ok) {
    return { error: ctx.error, complaints: [], isDemo: false };
  }
  const { supabase, user, profile, flatDisplay } = ctx;

  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('resident_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getMyComplaints] DB query error:', error);
    return { error: error.message, complaints: [], isDemo: false };
  }

  const rows = (data || []) as DbComplaint[];
  const mapped: Complaint[] = rows.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description || '',
    category: c.category,
    status: c.status,
    priority: c.priority,
    residentId: c.resident_id,
    residentName: profile.full_name || 'Resident',
    flat: flatDisplay || 'Not assigned',
    societyId: c.society_id,
    assignedTo: c.assigned_to,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    resolvedAt: c.resolved_at,
  }));

  return { complaints: mapped, societyId: ctx.membership.society_id, residentId: user.id, isDemo: false };
}

// ─── 3. Get Admin Complaints (Admin) ──────────────────────────────────────────

export async function getAdminComplaints(): Promise<ComplaintActionResult> {
  const ctx = await getAuthAdminContext();
  if (!ctx.ok) {
    return { error: ctx.error, complaints: [], isDemo: false };
  }
  const { supabase, societyId } = ctx;

  const { data, error } = await supabase
    .from('complaints')
    .select(`
      *,
      resident:profiles!resident_id(full_name)
    `)
    .eq('society_id', societyId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getAdminComplaints] DB query error:', error);
    return { error: error.message, complaints: [], isDemo: false };
  }

  const rows = data || [];

  // Fetch flat numbers for all unique resident_ids in this society
  const residentIds = Array.from(new Set(rows.map((r: { resident_id: string }) => r.resident_id)));
  const flatMap: Record<string, string> = {};

  if (residentIds.length > 0) {
    const { data: members } = await supabase
      .from('society_memberships')
      .select('user_id, flat_number, block')
      .eq('society_id', societyId)
      .in('user_id', residentIds);

    if (members) {
      for (const m of members) {
        flatMap[m.user_id] = m.flat_number
          ? (m.block ? `Flat ${m.block}-${m.flat_number}` : `Flat ${m.flat_number}`)
          : '—';
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped: Complaint[] = rows.map((c: any) => ({
    id: c.id,
    title: c.title,
    description: c.description || '',
    category: c.category,
    status: c.status as ComplaintStatus,
    priority: c.priority as ComplaintPriority,
    residentId: c.resident_id,
    residentName: c.resident?.full_name || 'Resident',
    flat: flatMap[c.resident_id] || '—',
    societyId: c.society_id,
    assignedTo: c.assigned_to,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    resolvedAt: c.resolved_at,
  }));

  return { complaints: mapped, societyId, isDemo: false };
}

// ─── 3b. Get Complaint By ID (Targeted authoritative re-fetch) ───────────────

export async function getComplaintById(complaintId: string): Promise<ComplaintActionResult> {
  if (!complaintId || typeof complaintId !== 'string') {
    return { error: 'Valid complaint ID is required.' };
  }

  // Try admin context first
  const adminCtx = await getAuthAdminContext();
  if (adminCtx.ok) {
    const { supabase, societyId } = adminCtx;
    const { data, error } = await supabase
      .from('complaints')
      .select('*, resident:profiles!resident_id(full_name)')
      .eq('id', complaintId)
      .eq('society_id', societyId)
      .single();

    if (error || !data) {
      return { error: 'Complaint not found.' };
    }

    let flatDisplay = '—';
    const { data: member } = await supabase
      .from('society_memberships')
      .select('flat_number, block')
      .eq('society_id', societyId)
      .eq('user_id', data.resident_id)
      .maybeSingle();

    if (member) {
      flatDisplay = member.flat_number
        ? (member.block ? `Flat ${member.block}-${member.flat_number}` : `Flat ${member.flat_number}`)
        : '—';
    }

    const mapped: Complaint = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      category: data.category,
      status: data.status,
      priority: data.priority,
      residentId: data.resident_id,
      residentName: (data.resident as { full_name: string | null } | null)?.full_name || 'Resident',
      flat: flatDisplay,
      societyId: data.society_id,
      assignedTo: data.assigned_to,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      resolvedAt: data.resolved_at,
    };

    return { success: true, complaint: mapped };
  }

  // Otherwise resident context
  const resCtx = await getAuthResidentContext();
  if (resCtx.ok) {
    const { supabase, user, profile, flatDisplay } = resCtx;
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('id', complaintId)
      .eq('resident_id', user.id)
      .single();

    if (error || !data) {
      return { error: 'Complaint not found.' };
    }

    const mapped: Complaint = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      category: data.category,
      status: data.status,
      priority: data.priority,
      residentId: data.resident_id,
      residentName: profile.full_name || 'Resident',
      flat: flatDisplay,
      societyId: data.society_id,
      assignedTo: data.assigned_to,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      resolvedAt: data.resolved_at,
    };

    return { success: true, complaint: mapped };
  }

  return { error: 'Authentication required.' };
}

// ─── 4. Update Complaint Status (Admin Only) ──────────────────────────────────

export async function updateComplaintStatus(
  complaintId: string,
  newStatus: ComplaintStatus
): Promise<ComplaintActionResult> {
  const validStatuses: ComplaintStatus[] = ['open', 'in_progress', 'resolved', 'closed'];
  if (!validStatuses.includes(newStatus)) {
    return { error: 'Invalid complaint status.' };
  }

  const ctx = await getAuthAdminContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }
  const { supabase, societyId } = ctx;

  // Verify complaint belongs to the admin's society
  const { data: existing, error: findError } = await supabase
    .from('complaints')
    .select('id, society_id')
    .eq('id', complaintId)
    .single();

  if (findError || !existing) {
    return { error: 'Complaint not found.' };
  }

  if (existing.society_id !== societyId) {
    return { error: 'Unauthorized: Complaint belongs to a different society.' };
  }

  const updatePayload: { status: ComplaintStatus; resolved_at?: string | null } = {
    status: newStatus,
  };

  if (newStatus === 'resolved' || newStatus === 'closed') {
    updatePayload.resolved_at = new Date().toISOString();
  } else {
    updatePayload.resolved_at = null;
  }

  const { error: updateError } = await supabase
    .from('complaints')
    .update(updatePayload)
    .eq('id', complaintId);

  if (updateError) {
    console.error('[updateComplaintStatus] update error:', updateError);
    return { error: `Failed to update status: ${updateError.message}` };
  }

  revalidatePath('/admin/complaints');
  revalidatePath('/resident/complaints');
  revalidatePath('/resident/dashboard');

  return { success: true };
}

// ─── 5. Update Complaint Priority (Admin Only) ────────────────────────────────

export async function updateComplaintPriority(
  complaintId: string,
  newPriority: ComplaintPriority
): Promise<ComplaintActionResult> {
  const validPriorities: ComplaintPriority[] = ['low', 'medium', 'high', 'urgent'];
  if (!validPriorities.includes(newPriority)) {
    return { error: 'Invalid complaint priority.' };
  }

  const ctx = await getAuthAdminContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }
  const { supabase, societyId } = ctx;

  const { data: existing, error: findError } = await supabase
    .from('complaints')
    .select('id, society_id')
    .eq('id', complaintId)
    .single();

  if (findError || !existing) {
    return { error: 'Complaint not found.' };
  }

  if (existing.society_id !== societyId) {
    return { error: 'Unauthorized: Complaint belongs to a different society.' };
  }

  const { error: updateError } = await supabase
    .from('complaints')
    .update({ priority: newPriority })
    .eq('id', complaintId);

  if (updateError) {
    console.error('[updateComplaintPriority] update error:', updateError);
    return { error: `Failed to update priority: ${updateError.message}` };
  }

  revalidatePath('/admin/complaints');
  revalidatePath('/resident/complaints');

  return { success: true };
}

// ─── 6. Assign Complaint (Admin Only) ─────────────────────────────────────────

export async function assignComplaint(
  complaintId: string,
  staffId: string | null
): Promise<ComplaintActionResult> {
  const ctx = await getAuthAdminContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }
  const { supabase, societyId } = ctx;

  const { data: existing, error: findError } = await supabase
    .from('complaints')
    .select('id, society_id')
    .eq('id', complaintId)
    .single();

  if (findError || !existing) {
    return { error: 'Complaint not found.' };
  }

  if (existing.society_id !== societyId) {
    return { error: 'Unauthorized: Complaint belongs to a different society.' };
  }

  const { error: updateError } = await supabase
    .from('complaints')
    .update({ assigned_to: staffId })
    .eq('id', complaintId);

  if (updateError) {
    console.error('[assignComplaint] update error:', updateError);
    return { error: `Failed to assign complaint: ${updateError.message}` };
  }

  revalidatePath('/admin/complaints');
  return { success: true };
}

