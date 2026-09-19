'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { Notice } from '@/lib/types';
import { DbNotice, NoticePriority } from '@/lib/supabase/types';

export interface NoticeActionResult {
  success?: boolean;
  error?: string;
  notice?: Notice;
  notices?: Notice[];
  isDemo?: boolean;
}

export interface CreateNoticeInput {
  title: string;
  category: string;
  content: string;
  priority?: NoticePriority;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
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

function parseEventDateAndTime(title: string, content: string): {
  date: string;
  time: string;
  venue: string;
} {
  const text = `${title} ${content}`.toLowerCase();

  const months: Record<string, string> = {
    jan: '01', january: '01',
    feb: '02', february: '02',
    mar: '03', march: '03',
    apr: '04', april: '04',
    may: '05',
    jun: '06', june: '06',
    jul: '07', july: '07',
    aug: '08', august: '08',
    sep: '09', september: '09',
    oct: '10', october: '10',
    nov: '11', november: '11',
    dec: '12', december: '12',
  };

  let date = '';
  const dateMatch =
    text.match(/(\d{1,2})\s*(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)/i) ||
    text.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})/i);

  if (dateMatch) {
    let day: string;
    let mStr: string;
    if (isNaN(Number(dateMatch[1]))) {
      mStr = dateMatch[1].toLowerCase();
      day = dateMatch[2].padStart(2, '0');
    } else {
      day = dateMatch[1].padStart(2, '0');
      mStr = dateMatch[2].toLowerCase();
    }
    const month = months[mStr] || '09';
    const year = '2026';
    date = `${year}-${month}-${day}`;
  }

  if (!date) {
    // Default to 7 days in the future
    const d = new Date();
    d.setDate(d.getDate() + 7);
    date = d.toISOString().split('T')[0];
  }

  let time = '19:00:00';
  const timeRangeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(?:to|-)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (timeRangeMatch) {
    let startH = parseInt(timeRangeMatch[1], 10);
    const startM = timeRangeMatch[2] || '00';
    const ampm = timeRangeMatch[5]?.toLowerCase();
    if (ampm === 'pm' && startH < 12) startH += 12;
    if (ampm === 'am' && startH === 12) startH = 0;
    time = `${startH.toString().padStart(2, '0')}:${startM}:00`;
  } else {
    const singleTimeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (singleTimeMatch) {
      let h = parseInt(singleTimeMatch[1], 10);
      const m = singleTimeMatch[2] || '00';
      const ampm = singleTimeMatch[3].toLowerCase();
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      time = `${h.toString().padStart(2, '0')}:${m}:00`;
    }
  }

  let venue = 'Clubhouse Hall';
  if (text.includes('lawn')) venue = 'Clubhouse Lawn';
  else if (text.includes('garden')) venue = 'Society Garden';
  else if (text.includes('temple')) venue = 'Society Temple';
  else if (text.includes('ground')) venue = 'Society Ground';

  return { date, time, venue };
}

function mapDbNoticeToNotice(db: DbNotice, publisherName = 'Management Committee'): Notice {
  return {
    id: db.id,
    societyId: db.society_id,
    title: db.title,
    content: db.content,
    category: (db.category as Notice['category']) || 'general',
    priority: db.priority,
    publishedAt: db.published_at || db.created_at,
    publishedBy: publisherName,
  };
}

// --- 1. Get Society Notices (Resident / Admin / Security) --------------------

// --- 1. Get Society Notices (Resident / Admin / Security) --------------------

export async function getSocietyNotices(): Promise<NoticeActionResult> {
  const ctx = await getAuthMemberContext();
  if (!ctx.ok) {
    return { error: ctx.error, notices: [], isDemo: false };
  }

  const { data, error } = await ctx.supabase
    .from('notices')
    .select(`
      *,
      profiles:published_by (full_name)
    `)
    .eq('society_id', ctx.societyId)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('[getSocietyNotices] query error:', error);
    return { error: error.message, notices: [], isDemo: false };
  }

  interface JoinedNoticeRow extends DbNotice {
    profiles?: { full_name: string | null } | null;
  }
  const notices = ((data as unknown as JoinedNoticeRow[]) || []).map((row) =>
    mapDbNoticeToNotice(row, row.profiles?.full_name || 'Management Committee')
  );

  return { notices, isDemo: false };
}

// --- 2. Create Notice (Admin only) -------------------------------------------

export async function createNotice(input: CreateNoticeInput): Promise<NoticeActionResult> {
  const title = input.title?.trim();
  const content = input.content?.trim();
  const category = (input.category?.trim() || 'general').toLowerCase();
  const priority = input.priority || 'normal';

  if (!title || title.length < 3 || title.length > 200) {
    return { error: 'Notice title must be between 3 and 200 characters.' };
  }
  if (!content || content.length < 5 || content.length > 5000) {
    return { error: 'Notice content must be between 5 and 5000 characters.' };
  }
  const validCategories = ['general', 'maintenance', 'event', 'urgent', 'financial'];
  if (!validCategories.includes(category)) {
    return { error: 'Invalid notice category.' };
  }
  const validPriorities = ['normal', 'important', 'urgent'];
  if (!validPriorities.includes(priority)) {
    return { error: 'Invalid notice priority.' };
  }

  const ctx = await getAuthAdminContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const insertPayload = {
    society_id: ctx.societyId,
    title,
    content,
    category,
    priority,
    published_by: ctx.user.id,
    published_at: new Date().toISOString(),
  };

  const { data, error } = await ctx.supabase
    .from('notices')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error) {
    console.error('[createNotice] insert error:', error);
    return { error: error.message };
  }

  // If this notice is an Event, automatically create/ensure the corresponding public.events record exists
  if (category === 'event') {
    try {
      const parsed = parseEventDateAndTime(title, content);
      const eventDate = input.eventDate || parsed.date;
      const eventTime = input.eventTime || parsed.time;
      const eventVenue = input.eventVenue || parsed.venue;

      // Check if an event with this title, society, and date already exists
      const { data: existingEvent } = await ctx.supabase
        .from('events')
        .select('id')
        .eq('society_id', ctx.societyId)
        .ilike('title', title)
        .eq('event_date', eventDate)
        .maybeSingle();

      if (!existingEvent) {
        await ctx.supabase
          .from('events')
          .insert({
            society_id: ctx.societyId,
            title,
            description: content,
            event_date: eventDate,
            start_time: eventTime,
            location: eventVenue,
            created_by: ctx.user.id,
          });
      }
    } catch (evErr) {
      console.error('[createNotice] auto-create event error:', evErr);
    }
  }

  revalidatePath('/resident/notices');
  revalidatePath('/admin/notices');
  revalidatePath('/resident/events');

  return {
    success: true,
    notice: mapDbNoticeToNotice(data as DbNotice, ctx.profile.full_name || 'Management Committee'),
  };
}

// --- 3. Update Notice (Admin only) -------------------------------------------

export async function updateNotice(
  noticeId: string,
  updates: Partial<CreateNoticeInput>
): Promise<NoticeActionResult> {
  const ctx = await getAuthAdminContext();
  if (!ctx.ok) {
    return { error: ctx.error };
  }

  const updatePayload: Partial<DbNotice> = {};
  if (updates.title) updatePayload.title = updates.title.trim();
  if (updates.content) updatePayload.content = updates.content.trim();
  if (updates.category) updatePayload.category = updates.category.trim();
  if (updates.priority) updatePayload.priority = updates.priority;

  const { data, error } = await ctx.supabase
    .from('notices')
    .update(updatePayload)
    .eq('id', noticeId)
    .eq('society_id', ctx.societyId)
    .select('*')
    .single();

  if (error) {
    console.error('[updateNotice] update error:', error);
    return { error: error.message };
  }

  revalidatePath('/resident/notices');
  revalidatePath('/admin/notices');

  return {
    success: true,
    notice: mapDbNoticeToNotice(data as DbNotice, ctx.profile.full_name || 'Management Committee'),
  };
}
