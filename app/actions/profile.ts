'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/lib/supabase/types';

export interface UserProfileData {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: UserRole;
  societyId: string | null;
  societyName: string | null;
  societyAddress: string | null;
  city: string | null;
  state: string | null;
  flatNumber: string | null;
  block: string | null;
  flatDisplay: string | null;
  membershipStatus: string | null;
  memberSince: string | null;
  providerName?: string | null;
  providerCategory?: string | null;
  providerRating?: number | null;
  providerExperience?: string | null;
  providerStartingPrice?: number | null;
  providerAvailable?: boolean | null;
  providerBio?: string | null;
  providerAddress?: string | null;
  providerLatitude?: number | null;
  providerLongitude?: number | null;
}

export interface ProfileUpdateResult {
  success: boolean;
  error?: string;
}

/**
 * Retrieves the currently authenticated user's complete profile,
 * society membership, and role details directly from Supabase.
 * Strictly uses supabase.auth.getUser() — never trusts client input.
 */
export async function getCurrentUserProfile(): Promise<UserProfileData | null> {
  try {
    const supabase = await createClient();

    // 1. Authenticate with verified JWT
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // 2. Query authoritative profile row
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, avatar_url, role, created_at')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('[getCurrentUserProfile] Profile lookup error:', profileError);
      return null;
    }

    const role = profile.role as UserRole;

    // 3. Query society membership (active first, otherwise latest)
    let membership: {
      id: string;
      society_id: string;
      flat_number: string | null;
      block: string | null;
      status: string;
      created_at: string;
      societies: {
        id: string;
        name: string;
        address: string | null;
        city: string | null;
        state: string | null;
      } | null;
    } | null = null;

    const { data: activeMem } = await supabase
      .from('society_memberships')
      .select('id, society_id, flat_number, block, status, created_at, societies(id, name, address, city, state)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (activeMem) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      membership = activeMem as any;
    } else {
      const { data: anyMem } = await supabase
        .from('society_memberships')
        .select('id, society_id, flat_number, block, status, created_at, societies(id, name, address, city, state)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (anyMem) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        membership = anyMem as any;
      }
    }

    // 4. If provider, query service_providers record
    let providerName: string | null = null;
    let providerCategory: string | null = null;
    let providerRating: number | null = null;
    let providerExperience: string | null = null;
    let providerStartingPrice: number | null = null;
    let providerAvailable: boolean | null = null;
    let providerBio: string | null = null;
    let providerAddress: string | null = null;
    let providerLatitude: number | null = null;
    let providerLongitude: number | null = null;

    if (role === 'provider') {
      const { data: pro } = await supabase
        .from('service_providers')
        .select('id, name, category, rating, experience, starting_price, available, bio, address, latitude, longitude')
        .eq('user_id', user.id)
        .maybeSingle();

      if (pro) {
        providerName = pro.name;
        providerCategory = pro.category;
        providerRating = pro.rating;
        providerExperience = pro.experience;
        providerStartingPrice = pro.starting_price;
        providerAvailable = pro.available;
        providerBio = pro.bio;
        providerAddress = pro.address ?? null;
        providerLatitude = pro.latitude != null ? Number(pro.latitude) : null;
        providerLongitude = pro.longitude != null ? Number(pro.longitude) : null;
      }
    }

    // 5. Build flat display string
    const flatNumber = membership?.flat_number || null;
    const block = membership?.block || null;
    let flatDisplay: string | null = null;
    if (flatNumber) {
      flatDisplay = block ? `Flat ${block}-${flatNumber}` : `Flat ${flatNumber}`;
    }

    // 6. Format member since date
    const memberSinceDate = membership?.created_at || profile.created_at;
    const memberSince = memberSinceDate
      ? new Date(memberSinceDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : null;

    const society = membership?.societies;

    return {
      id: user.id,
      fullName: profile.full_name || '',
      phone: profile.phone || null,
      email: user.email || null,
      avatarUrl: profile.avatar_url || null,
      role,
      societyId: membership?.society_id || null,
      societyName: society?.name || null,
      societyAddress: society?.address || null,
      city: society?.city || null,
      state: society?.state || null,
      flatNumber,
      block,
      flatDisplay,
      membershipStatus: membership?.status || null,
      memberSince,
      providerName,
      providerCategory,
      providerRating,
      providerExperience,
      providerStartingPrice,
      providerAvailable,
      providerBio,
      providerAddress,
      providerLatitude,
      providerLongitude,
    };
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'digest' in err &&
      (err as { digest?: string }).digest === 'DYNAMIC_SERVER_USAGE'
    ) {
      throw err;
    }
    console.error('[getCurrentUserProfile] Unexpected error:', err);
    return null;
  }
}

/**
 * Safely updates the currently authenticated user's editable profile fields:
 * - full_name
 * - phone
 *
 * Strictly updates auth.uid() row only. Protected fields (id, role, society_id,
 * flat_number, email, created_at, permissions) cannot be altered.
 */
export async function updateUserProfile(data: {
  fullName?: string;
  phone?: string;
}): Promise<ProfileUpdateResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Authentication required. Please sign in.' };
    }

    const updates: { full_name?: string; phone?: string | null; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };

    if (data.fullName !== undefined) {
      const trimmedName = data.fullName.trim();
      if (!trimmedName) {
        return { success: false, error: 'Full name cannot be empty.' };
      }
      if (trimmedName.length > 100) {
        return { success: false, error: 'Full name cannot exceed 100 characters.' };
      }
      updates.full_name = trimmedName;
    }

    if (data.phone !== undefined) {
      const trimmedPhone = data.phone.trim();
      if (trimmedPhone.length > 20) {
        return { success: false, error: 'Phone number cannot exceed 20 characters.' };
      }
      updates.phone = trimmedPhone || null;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (updateError) {
      console.error('[updateUserProfile] DB update error:', updateError);
      return { success: false, error: updateError.message };
    }

    // Revalidate all profile and settings views
    revalidatePath('/resident/profile');
    revalidatePath('/resident/settings');
    revalidatePath('/resident/dashboard');
    revalidatePath('/admin/settings');
    revalidatePath('/security/settings');
    revalidatePath('/provider/settings');
    revalidatePath('/provider/earnings');

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    return { success: false, error: message };
  }
}
