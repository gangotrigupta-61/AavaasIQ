'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Retrieves the society description for the currently authenticated admin's society.
 * Returns null if the user has no society membership or if description is unset.
 */
export async function getSocietyDescription(): Promise<{ description: string | null } | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    // Get the user's society membership
    const { data: membership, error: membershipError } = await supabase
      .from('society_memberships')
      .select('society_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership) return null;

    const { data: society, error: societyError } = await supabase
      .from('societies')
      .select('description')
      .eq('id', membership.society_id)
      .maybeSingle();

    if (societyError) {
      console.error('[getSocietyDescription] Error fetching society description:', societyError);
      return null;
    }

    return { description: (society as { description: string | null } | null)?.description ?? null };
  } catch (err) {
    console.error('[getSocietyDescription] Unexpected error:', err);
    return null;
  }
}

/**
 * Updates the society description for the currently authenticated admin's society.
 * Only admins should be calling this action.
 * RLS will reject if the user is not an admin with membership in that society.
 */
export async function updateSocietyDescription(
  description: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (description.length > 2000) {
      return { success: false, error: 'Description must be 2000 characters or fewer.' };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Not authenticated.' };

    // Get the user's society membership
    const { data: membership, error: membershipError } = await supabase
      .from('society_memberships')
      .select('society_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle();

    if (membershipError || !membership) {
      return { success: false, error: 'Society membership not found.' };
    }

    const { error: updateError } = await supabase
      .from('societies')
      .update({ description: description.trim() || null })
      .eq('id', membership.society_id);

    if (updateError) {
      console.error('[updateSocietyDescription] Update error:', updateError);
      return { success: false, error: 'Failed to save description. Please try again.' };
    }

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (err) {
    console.error('[updateSocietyDescription] Unexpected error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
