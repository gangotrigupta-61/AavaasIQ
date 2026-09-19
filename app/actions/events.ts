'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { CommunityEvent } from '@/lib/types';

export interface EventActionResult {
  success?: boolean;
  error?: string;
  event?: CommunityEvent;
  events?: CommunityEvent[];
  rsvps?: { id: string; residentName: string; status: string; createdAt: string }[];
  isDemo?: boolean;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  date: string;
  time?: string;
  venue?: string;
  category?: string;
}

type AuthMemberContext =
  | { ok: false; error: string }
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
      user: NonNullable<Awaited<ReturnType<Awaited<ReturnType<typeof createClient>>['auth']['getUser']>>['data']['user']>;
      profile: { id: string; full_name: string | null; role: string };
      societyId: string;
    };

async function getAuthMemberContext(): Promise<AuthMemberContext> {
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
    .select('society_id, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (membershipError || !membership) {
    return {
      ok: false,
      error: 'No active society membership found.',
    };
  }

  return {
    ok: true,
    supabase,
    user,
    profile,
    societyId: membership.society_id,
  };
}

async function getAuthAdminContext(): Promise<AuthMemberContext> {
  const ctx = await getAuthMemberContext();
  if (!ctx.ok) return ctx;

  if (ctx.profile.role !== 'admin') {
    return { ok: false, error: 'Unauthorized: Society administrator access required.' };
  }

  return ctx;
}

// --- 1. Get Society Events ----------------------------------------------------

// --- 1. Get Society Events ----------------------------------------------------

export async function getSocietyEvents(): Promise<EventActionResult> {
  const ctx = await getAuthMemberContext();
  if (!ctx.ok) {
    return { error: ctx.error, events: [], isDemo: false };
  }

  // Safe cutoff allows events from yesterday UTC to safely handle IST timezone differences (+5:30)
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Fetch all upcoming events for the society, ordered chronologically (nearest upcoming first)
  const { data: eventsData, error: eventsError } = await ctx.supabase
    .from('events')
    .select(`
      *,
      profiles:created_by (full_name),
      event_rsvps (id, resident_id, status)
    `)
    .eq('society_id', ctx.societyId)
    .gte('event_date', cutoffDate)
    .order('event_date', { ascending: true });

  if (eventsError) {
    console.error('[getSocietyEvents] query error:', eventsError);
    return { error: 'Unable to fetch events. Please try again.', events: [], isDemo: false };
  }

  interface JoinedEventRow {
    id: string;
    society_id: string;
    title: string;
    description: string | null;
    event_date: string;
    start_time: string | null;
    location: string | null;
    profiles?: { full_name: string | null } | null;
    event_rsvps?: { id: string; resident_id: string; status: string }[];
  }

  const events: CommunityEvent[] = ((eventsData as unknown as JoinedEventRow[]) || []).map((row) => {
    const rsvps = row.event_rsvps || [];
    const goingRsvps = rsvps.filter((r) => r.status === 'going');
    const isUserRsvpd = rsvps.some((r) => r.resident_id === ctx.user.id && r.status === 'going');

    let category: CommunityEvent['category'] = 'festival';
    const catLower = (row.description || '').toLowerCase();
    if (catLower.includes('meeting') || catLower.includes('agm')) category = 'meeting';
    else if (catLower.includes('sports') || catLower.includes('yoga')) category = 'sports';
    else if (catLower.includes('cultural') || catLower.includes('drawing')) category = 'cultural';
    else if (catLower.includes('maintenance')) category = 'maintenance';

    return {
      id: row.id,
      societyId: row.society_id,
      title: row.title,
      description: row.description || '',
      date: row.event_date,
      time: row.start_time ? row.start_time.slice(0, 5) : '10:00 AM',
      venue: row.location || 'Clubhouse',
      organiser: row.profiles?.full_name || 'Management Committee',
      category,
      rsvpCount: goingRsvps.length,
      isUserRsvpd,
    };
  });

  return { events, isDemo: false };
}

// --- 2. Create Event (Admin) --------------------------------------------------

export async function createEvent(input: CreateEventInput): Promise<EventActionResult> {
  const title = input.title?.trim();
  const date = input.date?.trim();

  if (!title || title.length < 3 || title.length > 200) {
    return { error: 'Event title must be between 3 and 200 characters.' };
  }
  if (!date || isNaN(new Date(date).getTime())) {
    return { error: 'A valid event date is required.' };
  }
  if (input.description && input.description.length > 2000) {
    return { error: 'Description must not exceed 2000 characters.' };
  }
  if (input.venue && input.venue.length > 200) {
    return { error: 'Venue must not exceed 200 characters.' };
  }

  const ctx = await getAuthAdminContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  // Deduplication check: avoid duplicate event records
  const { data: existingEvent } = await ctx.supabase
    .from('events')
    .select('*, profiles:created_by (full_name)')
    .eq('society_id', ctx.societyId)
    .ilike('title', title)
    .eq('event_date', date)
    .maybeSingle();

  if (existingEvent) {
    return {
      success: true,
      event: {
        id: existingEvent.id,
        societyId: existingEvent.society_id,
        title: existingEvent.title,
        description: existingEvent.description || '',
        date: existingEvent.event_date,
        time: existingEvent.start_time ? existingEvent.start_time.slice(0, 5) : '10:00',
        venue: existingEvent.location || 'Clubhouse',
        organiser: existingEvent.profiles?.full_name || ctx.profile.full_name || 'Management Committee',
        category: 'festival',
        rsvpCount: 0,
        isUserRsvpd: false,
      },
    };
  }

  const insertPayload = {
    society_id: ctx.societyId,
    title,
    description: input.description?.trim() || null,
    event_date: date,
    start_time: input.time || '19:00:00',
    location: input.venue?.trim() || 'Clubhouse Hall',
    created_by: ctx.user.id,
  };

  const { data, error } = await ctx.supabase
    .from('events')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    console.error('[createEvent] insert error:', error);
    return { error: 'Unable to create event. Please try again.' };
  }

  revalidatePath('/resident/notices');
  revalidatePath('/admin/notices');
  revalidatePath('/resident/events');

  return {
    success: true,
    event: {
      id: data.id,
      societyId: data.society_id,
      title: data.title,
      description: data.description || '',
      date: data.event_date,
      time: data.start_time ? data.start_time.slice(0, 5) : '10:00',
      venue: data.location || 'Clubhouse',
      organiser: ctx.profile.full_name || 'Management Committee',
      category: 'festival',
      rsvpCount: 0,
      isUserRsvpd: false,
    },
  };
}

// --- 3. RSVP to Event (Resident / Member) -------------------------------------

export async function rsvpEvent(
  eventId: string,
  newStatus: 'going' | 'not_going' = 'going'
): Promise<EventActionResult> {
  if (!eventId?.trim()) {
    return { error: 'Event ID is required.' };
  }

  if (newStatus === 'not_going') {
    return cancelEventRsvp(eventId);
  }

  const ctx = await getAuthMemberContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  // Verify event exists and belongs to resident's society
  const { data: event, error: eventErr } = await ctx.supabase
    .from('events')
    .select('id, society_id')
    .eq('id', eventId)
    .maybeSingle();

  if (eventErr || !event) {
    console.error('[rsvpEvent] event lookup error:', eventErr);
    return { error: 'Event not found.' };
  }

  if (event.society_id !== ctx.societyId) {
    return { error: 'You are not authorized to RSVP to this event.' };
  }

  // Upsert RSVP for current authenticated resident
  const { error: upsertErr } = await ctx.supabase
    .from('event_rsvps')
    .upsert(
      {
        event_id: eventId,
        resident_id: ctx.user.id,
        status: 'going',
      },
      { onConflict: 'event_id,resident_id' }
    );

  if (upsertErr) {
    console.error('[rsvpEvent] upsert error:', upsertErr);
    return { error: 'Unable to save RSVP. Please try again.' };
  }

  revalidatePath('/resident/notices');
  revalidatePath('/resident/events');

  return { success: true };
}

// --- 4. Cancel RSVP to Event (Resident / Member) ------------------------------

export async function cancelEventRsvp(eventId: string): Promise<EventActionResult> {
  if (!eventId?.trim()) {
    return { error: 'Event ID is required.' };
  }

  const ctx = await getAuthMemberContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  // Delete RSVP where event_id matches and resident_id is auth.uid()
  const { error: deleteErr } = await ctx.supabase
    .from('event_rsvps')
    .delete()
    .eq('event_id', eventId)
    .eq('resident_id', ctx.user.id);

  if (deleteErr) {
    console.error('[cancelEventRsvp] delete error:', deleteErr);
    return { error: 'Unable to cancel RSVP. Please try again.' };
  }

  revalidatePath('/resident/notices');
  revalidatePath('/resident/events');

  return { success: true };
}

// --- 5. Get Event RSVPs (Admin / Member) --------------------------------------

export async function getEventRsvps(eventId: string): Promise<EventActionResult> {
  const ctx = await getAuthMemberContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const { data, error } = await ctx.supabase
    .from('event_rsvps')
    .select(`
      id,
      status,
      created_at,
      profiles:resident_id (full_name)
    `)
    .eq('event_id', eventId);

  if (error) {
    console.error('[getEventRsvps] query error:', error);
    return { error: 'Unable to fetch RSVPs.' };
  }

  interface JoinedRsvpRow {
    id: string;
    status: string;
    created_at: string;
    profiles?: { full_name: string | null } | null;
  }
  const rsvps = ((data as unknown as JoinedRsvpRow[]) || []).map((r) => ({
    id: r.id,
    residentName: r.profiles?.full_name || 'Resident',
    status: r.status,
    createdAt: r.created_at,
  }));

  return { rsvps };
}
