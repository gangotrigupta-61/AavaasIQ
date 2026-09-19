'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ServiceProvider, ServiceBooking } from '@/lib/types';
import { DbServiceProvider, DbServiceBooking, ServiceBookingStatus } from '@/lib/supabase/types';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ServiceActionResult<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
  providerId?: string;
}

export interface CreateBookingInput {
  providerId: string;
  serviceTitle: string;
  scheduledAt: string;
  amount: number;
  description?: string;
}

export interface ProviderDashboardStats {
  providerId?: string;
  providerName?: string;
  providerCategory?: string;
  newRequestsCount: number;
  todayJobsCount: number;
  monthCompletedCount: number;
  monthEarnings: number;
  newRequests: ServiceBooking[];
  todaySchedule: Array<{
    id: string;
    time: string;
    service: string;
    flat: string;
    resident: string;
    status: 'completed' | 'in_progress' | 'upcoming';
  }>;
  recentTransactions: Array<{
    id: string;
    service: string;
    flat: string;
    date: string;
    amount: number;
  }>;
  monthlyEarnings: Array<{
    month: string;
    amount: number;
    jobs: number;
  }>;
}

export interface ProviderEarningsData {
  thisMonth: { amount: number; jobs: number };
  lastMonth: { amount: number; jobs: number };
  growthPct: number;
  totalJobs: number;
  totalEarnings: number;
  rating: number;
  reviewCount: number;
  monthlyEarnings: Array<{ month: string; amount: number; jobs: number }>;
  recentTransactions: Array<{ id: string; service: string; flat: string; date: string; amount: number }>;
}

export interface BookingRowWithRelations extends DbServiceBooking {
  service_providers?: { name: string } | null;
  profiles?: { full_name: string | null } | null;
}

// ─── Context Resolution Helpers ───────────────────────────────────────────────

async function getAuthResidentSocietyContext() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { ok: false as const, error: 'Authentication required. Please sign in.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  const { data: membership } = await supabase
    .from('society_memberships')
    .select('society_id, flat_number, block, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership?.society_id) {
    return { ok: false as const, error: 'Active society membership required.' };
  }

  return {
    ok: true as const,
    supabase,
    user,
    profile,
    membership,
    societyId: membership.society_id,
  };
}

async function getAuthProviderContext() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { ok: false as const, error: 'Authentication required. Please sign in.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  // Find provider row linked to this user_id
  const { data: provider } = await supabase
    .from('service_providers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    ok: true as const,
    supabase,
    user,
    profile,
    provider: provider as DbServiceProvider | null,
    societyId: provider?.society_id ?? null,
  };
}

async function getAuthAdminSocietyContext() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { ok: false as const, error: 'Authentication required. Please sign in.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { ok: false as const, error: 'Admin privileges required.' };
  }

  const { data: membership } = await supabase
    .from('society_memberships')
    .select('society_id, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!membership?.society_id) {
    return { ok: false as const, error: 'Admin society membership required.' };
  }

  return {
    ok: true as const,
    supabase,
    user,
    profile,
    societyId: membership.society_id,
  };
}

// ─── Mapper: DbServiceProvider -> ServiceProvider ────────────────────────────

function mapDbServiceProvider(row: DbServiceProvider): ServiceProvider {
  return {
    id: row.id,
    societyId: row.society_id,
    userId: row.user_id,
    name: row.name,
    category: row.category,
    phone: row.phone,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    experience: row.experience ?? '',
    startingPrice: row.starting_price,
    verified: row.verified,
    available: row.available,
    bio: row.bio ?? '',
  };
}

// ─── Mapper: DbServiceBooking -> ServiceBooking ───────────────────────────────

function mapDbServiceBooking(row: BookingRowWithRelations): ServiceBooking {
  return {
    id: row.id,
    providerId: row.provider_id,
    providerName: row.service_providers?.name ?? 'Assigned Provider',
    residentId: row.resident_id,
    residentName: row.profiles?.full_name ?? 'Resident',
    service: row.service_title,
    serviceTitle: row.service_title,
    notes: row.description,
    scheduledAt: row.scheduled_at,
    status: row.status as ServiceBookingStatus,
    amount: row.amount,
    flat: row.flat_number ? (row.block ? `${row.block}-${row.flat_number}` : row.flat_number) : 'N/A',
    block: row.block,
    createdAt: row.created_at,
  };
}

// ─── 1. Get Service Providers (Resident / General) ───────────────────────────

export async function getServiceProviders(category?: string): Promise<ServiceActionResult<ServiceProvider[]>> {
  const ctx = await getAuthResidentSocietyContext();
  if (!ctx.ok) {
    // If not resident, try any authenticated user's society via provider or admin context
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Authentication required. Please sign in.' };
    }
    // Query providers the user has RLS permission to read
    let query = supabase.from('service_providers').select('*').order('name');
    if (category && category !== 'All') {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) return { error: error.message };
    return { data: (data as DbServiceProvider[]).map(mapDbServiceProvider) };
  }

  let query = ctx.supabase
    .from('service_providers')
    .select('*')
    .eq('society_id', ctx.societyId)
    .order('name');

  if (category && category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };
  return { data: (data as DbServiceProvider[]).map(mapDbServiceProvider) };
}

// ─── 2. Create Service Booking (Resident) ─────────────────────────────────────

export async function createServiceBooking(input: CreateBookingInput): Promise<ServiceActionResult<ServiceBooking>> {
  const ctx = await getAuthResidentSocietyContext();
  if (!ctx.ok) return { error: ctx.error };

  if (!input.providerId || !input.serviceTitle?.trim()) {
    return { error: 'Provider and service description are required.' };
  }

  if (!input.scheduledAt) {
    return { error: 'Scheduled date and time are required.' };
  }

  // Ensure scheduled date is in the future
  const schedTime = new Date(input.scheduledAt).getTime();
  if (isNaN(schedTime)) {
    return { error: 'Invalid scheduled date and time.' };
  }

  const insertData = {
    society_id: ctx.societyId,
    provider_id: input.providerId,
    resident_id: ctx.user.id,
    service_title: input.serviceTitle.trim(),
    description: input.description?.trim() || null,
    flat_number: ctx.membership.flat_number || 'N/A',
    block: ctx.membership.block || null,
    scheduled_at: new Date(input.scheduledAt).toISOString(),
    status: 'pending' as ServiceBookingStatus,
    amount: input.amount > 0 ? input.amount : 300,
  };

  const { data, error } = await ctx.supabase
    .from('service_bookings')
    .insert(insertData)
    .select('*, service_providers(name), profiles(full_name)')
    .single();

  if (error) {
    console.error('[createServiceBooking] insert error:', error);
    return { error: error.message };
  }

  revalidatePath('/resident/services');
  revalidatePath('/provider/dashboard');
  revalidatePath('/provider/requests');

  return { success: true, data: mapDbServiceBooking(data) };
}

// ─── 3. Provider Dashboard Data (Provider) ───────────────────────────────────

export async function getProviderDashboardData(): Promise<ServiceActionResult<ProviderDashboardStats>> {
  const ctx = await getAuthProviderContext();
  if (!ctx.ok) return { error: ctx.error };

  const providerId = ctx.provider?.id;
  if (!providerId) {
    // If provider row not found, return clean empty dashboard structure
    return {
      data: {
        newRequestsCount: 0,
        todayJobsCount: 0,
        monthCompletedCount: 0,
        monthEarnings: 0,
        newRequests: [],
        todaySchedule: [],
        recentTransactions: [],
        monthlyEarnings: [],
      },
    };
  }

  // Fetch all bookings for this provider
  const { data: bookings, error } = await ctx.supabase
    .from('service_bookings')
    .select('*, profiles(full_name)')
    .eq('provider_id', providerId)
    .order('scheduled_at', { ascending: true });

  if (error) {
    console.error('[getProviderDashboardData] query error:', error);
    return { error: error.message };
  }

  const allBookings = bookings || [];
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // 1. Pending requests
  const pendingRequests = allBookings.filter((b) => b.status === 'pending');
  const mappedPending = pendingRequests.map(mapDbServiceBooking);

  // 2. Today's jobs
  const todayStr = now.toISOString().split('T')[0];
  const todayJobs = allBookings.filter((b) => {
    const schedDate = new Date(b.scheduled_at).toISOString().split('T')[0];
    return schedDate === todayStr && ['confirmed', 'in_progress', 'completed'].includes(b.status);
  });

  const todaySchedule = todayJobs.map((b) => {
    const d = new Date(b.scheduled_at);
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    let schedStatus: 'completed' | 'in_progress' | 'upcoming' = 'upcoming';
    if (b.status === 'completed') schedStatus = 'completed';
    else if (b.status === 'in_progress') schedStatus = 'in_progress';

    return {
      id: b.id,
      time: timeStr,
      service: b.service_title,
      flat: b.flat_number ? (b.block ? `${b.block}-${b.flat_number}` : b.flat_number) : 'N/A',
      resident: b.profiles?.full_name ?? 'Resident',
      status: schedStatus,
    };
  });

  // 3. Month completed & earnings
  const completedThisMonth = allBookings.filter((b) => {
    if (b.status !== 'completed') return false;
    const d = new Date(b.scheduled_at);
    return d >= startOfMonth && d <= now;
  });

  const monthEarnings = completedThisMonth.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  // 4. Recent transactions
  const allCompleted = allBookings
    .filter((b) => b.status === 'completed')
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  const recentTransactions = allCompleted.slice(0, 5).map((b) => ({
    id: b.id,
    service: b.service_title,
    flat: b.flat_number ? (b.block ? `${b.block}-${b.flat_number}` : b.flat_number) : 'N/A',
    date: b.scheduled_at,
    amount: Number(b.amount) || 0,
  }));

  // 5. Monthly earnings past 6 months
  const monthlyEarningsMap: Record<string, { amount: number; jobs: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    monthlyEarningsMap[label] = { amount: 0, jobs: 0 };
  }

  allCompleted.forEach((b) => {
    const d = new Date(b.scheduled_at);
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    if (monthlyEarningsMap[label]) {
      monthlyEarningsMap[label].amount += Number(b.amount) || 0;
      monthlyEarningsMap[label].jobs += 1;
    }
  });

  const monthlyEarnings = Object.entries(monthlyEarningsMap).map(([month, stats]) => ({
    month,
    amount: stats.amount,
    jobs: stats.jobs,
  }));

  return {
    data: {
      providerId: ctx.provider?.id,
      providerName: ctx.profile?.full_name || ctx.provider?.name || 'Provider',
      providerCategory: ctx.provider?.category || 'Services',
      newRequestsCount: pendingRequests.length,
      todayJobsCount: todayJobs.length,
      monthCompletedCount: completedThisMonth.length,
      monthEarnings,
      newRequests: mappedPending,
      todaySchedule,
      recentTransactions,
      monthlyEarnings,
    },
  };
}

// ─── 4. Get Provider Requests (Provider) ─────────────────────────────────────

export async function getProviderRequests(filter?: string): Promise<ServiceActionResult<ServiceBooking[]>> {
  const ctx = await getAuthProviderContext();
  if (!ctx.ok) return { error: ctx.error };

  const providerId = ctx.provider?.id;
  if (!providerId) return { data: [], providerId: undefined };

  let query = ctx.supabase
    .from('service_bookings')
    .select('*, profiles(full_name)')
    .eq('provider_id', providerId)
    .order('scheduled_at', { ascending: false });

  if (filter && ['pending', 'accepted', 'declined'].includes(filter)) {
    query = query.eq('status', filter);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  return { data: (data || []).map(mapDbServiceBooking), providerId };
}

// ─── 5. Update Service Request Status (Accept / Decline) ──────────────────────

export async function updateServiceRequestStatus(
  bookingId: string,
  action: 'accepted' | 'declined'
): Promise<ServiceActionResult> {
  const ctx = await getAuthProviderContext();
  if (!ctx.ok) return { error: ctx.error };

  const providerId = ctx.provider?.id;
  if (!providerId) return { error: 'Provider account not found.' };

  // If accepted, we set status to 'accepted' (or 'confirmed' for schedule)
  const newStatus: ServiceBookingStatus = action === 'accepted' ? 'confirmed' : 'declined';

  const { error } = await ctx.supabase
    .from('service_bookings')
    .update({ status: newStatus })
    .eq('id', bookingId)
    .eq('provider_id', providerId);

  if (error) {
    console.error('[updateServiceRequestStatus] update error:', error);
    return { error: error.message };
  }

  revalidatePath('/provider/dashboard');
  revalidatePath('/provider/requests');
  revalidatePath('/provider/bookings');

  return { success: true };
}

// ─── 6. Get Provider Bookings (Provider) ─────────────────────────────────────

export async function getProviderBookings(filter?: string): Promise<ServiceActionResult<ServiceBooking[]>> {
  const ctx = await getAuthProviderContext();
  if (!ctx.ok) return { error: ctx.error };

  const providerId = ctx.provider?.id;
  if (!providerId) return { data: [] };

  let query = ctx.supabase
    .from('service_bookings')
    .select('*, profiles(full_name)')
    .eq('provider_id', providerId)
    .order('scheduled_at', { ascending: false });

  if (filter && ['confirmed', 'in_progress', 'completed', 'cancelled'].includes(filter)) {
    query = query.eq('status', filter);
  }

  const { data, error } = await query;
  if (error) return { error: error.message };

  return { data: (data || []).map(mapDbServiceBooking) };
}

// ─── 7. Update Service Booking Status (Mark Complete / In Progress) ───────────

export async function updateServiceBookingStatus(
  bookingId: string,
  status: 'in_progress' | 'completed' | 'cancelled'
): Promise<ServiceActionResult> {
  const ctx = await getAuthProviderContext();
  if (!ctx.ok) return { error: ctx.error };

  const providerId = ctx.provider?.id;
  if (!providerId) return { error: 'Provider profile required.' };

  const { error } = await ctx.supabase
    .from('service_bookings')
    .update({ status })
    .eq('id', bookingId)
    .eq('provider_id', providerId);

  if (error) {
    console.error('[updateServiceBookingStatus] update error:', error);
    return { error: error.message };
  }

  revalidatePath('/provider/dashboard');
  revalidatePath('/provider/bookings');
  revalidatePath('/provider/earnings');

  return { success: true };
}

// ─── 8. Get Provider Earnings (Provider) ─────────────────────────────────────

export async function getProviderEarnings(): Promise<ServiceActionResult<ProviderEarningsData>> {
  const ctx = await getAuthProviderContext();
  if (!ctx.ok) return { error: ctx.error };

  const providerId = ctx.provider?.id;
  if (!providerId) {
    return {
      data: {
        thisMonth: { amount: 0, jobs: 0 },
        lastMonth: { amount: 0, jobs: 0 },
        growthPct: 0,
        totalJobs: 0,
        totalEarnings: 0,
        rating: 5.0,
        reviewCount: 0,
        monthlyEarnings: [],
        recentTransactions: [],
      },
    };
  }

  const { data: bookings, error } = await ctx.supabase
    .from('service_bookings')
    .select('*')
    .eq('provider_id', providerId)
    .eq('status', 'completed')
    .order('scheduled_at', { ascending: false });

  if (error) return { error: error.message };

  const completed = bookings || [];
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  let thisMonthAmount = 0;
  let thisMonthJobs = 0;
  let lastMonthAmount = 0;
  let lastMonthJobs = 0;

  completed.forEach((b) => {
    const d = new Date(b.scheduled_at);
    const amt = Number(b.amount) || 0;
    if (d >= startOfThisMonth && d <= now) {
      thisMonthAmount += amt;
      thisMonthJobs += 1;
    } else if (d >= startOfLastMonth && d <= endOfLastMonth) {
      lastMonthAmount += amt;
      lastMonthJobs += 1;
    }
  });

  const growthPct =
    lastMonthAmount > 0
      ? Math.round(((thisMonthAmount - lastMonthAmount) / lastMonthAmount) * 100)
      : thisMonthAmount > 0 ? 100 : 0;

  const totalEarnings = completed.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  // 6 month series
  const monthsData: Array<{ month: string; amount: number; jobs: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const inMonth = completed.filter((b) => {
      const bd = new Date(b.scheduled_at);
      return bd >= monthStart && bd <= monthEnd;
    });

    const amt = inMonth.reduce((s, b) => s + (Number(b.amount) || 0), 0);
    monthsData.push({ month: monthLabel, amount: amt, jobs: inMonth.length });
  }

  const recentTransactions = completed.slice(0, 10).map((b) => ({
    id: b.id,
    service: b.service_title,
    flat: b.flat_number ? (b.block ? `${b.block}-${b.flat_number}` : b.flat_number) : 'N/A',
    date: b.scheduled_at,
    amount: Number(b.amount) || 0,
  }));

  return {
    data: {
      thisMonth: { amount: thisMonthAmount, jobs: thisMonthJobs },
      lastMonth: { amount: lastMonthAmount, jobs: lastMonthJobs },
      growthPct,
      totalJobs: completed.length,
      totalEarnings,
      rating: ctx.provider?.rating ?? 4.8,
      reviewCount: ctx.provider?.review_count ?? 128,
      monthlyEarnings: monthsData,
      recentTransactions,
    },
  };
}

// ─── 9. Admin Service Providers (Admin) ───────────────────────────────────────

export async function getAdminServiceProviders(): Promise<ServiceActionResult<ServiceProvider[]>> {
  const ctx = await getAuthAdminSocietyContext();
  if (!ctx.ok) return { error: ctx.error };

  const { data, error } = await ctx.supabase
    .from('service_providers')
    .select('*')
    .eq('society_id', ctx.societyId)
    .order('name');

  if (error) return { error: error.message };

  return { data: (data as DbServiceProvider[]).map(mapDbServiceProvider) };
}

// ─── 10. Toggle Provider Availability (Admin or Provider) ─────────────────────

export async function toggleProviderAvailability(
  providerId: string,
  available: boolean
): Promise<ServiceActionResult> {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return { error: 'Authentication required.' };

  const { error } = await supabase
    .from('service_providers')
    .update({ available })
    .eq('id', providerId);

  if (error) return { error: error.message };

  revalidatePath('/admin/services');
  revalidatePath('/resident/services');
  return { success: true };
}
