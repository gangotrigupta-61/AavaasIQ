'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/supabase/types';

// ─── Role → portal mapping ────────────────────────────────────────────────────

const ROLE_REDIRECTS: Record<UserRole, string> = {
  resident: '/resident/dashboard',
  admin:    '/admin/dashboard',
  security: '/security/dashboard',
  provider: '/provider/dashboard',
};

function roleDestination(role: string | undefined): string {
  return ROLE_REDIRECTS[(role as UserRole)] ?? '/resident/dashboard';
}

// ─── Login ────────────────────────────────────────────────────────────────────

export interface AuthResult {
  error?: string;
  emailConfirmationRequired?: boolean;
}

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const email    = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    console.error('[loginAction] signInWithPassword error:', error?.message || 'No user returned');
    return { error: 'Invalid email or password. Please try again.' };
  }

  // Fetch authoritative role from the database profiles table (do NOT trust user_metadata)
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile?.role) {
    console.error('[loginAction] profile lookup error:', profileError);
    return { error: 'User profile not found. Please contact administrator.' };
  }

  const role = profile.role as UserRole;
  if (!ROLE_REDIRECTS[role]) {
    return { error: 'Invalid user role assigned. Please contact administrator.' };
  }

  redirect(roleDestination(role));
}


// ─── Signup ───────────────────────────────────────────────────────────────────

const VALID_ROLES: UserRole[] = ['resident', 'admin', 'security', 'provider'];

export async function signupAction(formData: FormData): Promise<AuthResult> {
  const role        = formData.get('role') as UserRole;
  const fullName    = (formData.get('fullName') as string)?.trim();
  const email       = (formData.get('email') as string)?.trim();
  const password    = formData.get('password') as string;
  const phone       = (formData.get('phone') as string)?.trim() || null;
  const societyName = (formData.get('societyName') as string)?.trim() || null;
  const block       = (formData.get('block') as string)?.trim() || null;
  const flatNumber  = (formData.get('flatNumber') as string)?.trim() || null;

  if (!role || !fullName || !email || !password) {
    return { error: 'Please fill in all required fields.' };
  }

  if (!VALID_ROLES.includes(role)) {
    return { error: 'Invalid account role selected.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  const cookieStore = await cookies();
  const supabase = await createClient();

  // ── 1. Create Supabase Auth user ────────────────────────────────────────────
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName,
      },
    },
  });

  if (authError) {
    console.error('[signupAction] auth.signUp error:', {
      name: authError.name,
      message: authError.message,
      status: authError.status,
      code: authError.code,
    });

    if (
      authError.code === 'over_email_send_rate_limit' ||
      authError.message?.toLowerCase().includes('rate limit')
    ) {
      return {
        error:
          'Supabase email rate limit exceeded (Free Tier allows max 3 confirmation emails/hour). Please turn OFF "Confirm email" in Supabase Dashboard (Authentication → Providers → Email) for instant signup.',
      };
    }
    if (authError.message?.toLowerCase().includes('already registered')) {
      return { error: 'An account with this email already exists. Please sign in.' };
    }
    if (authError.message?.toLowerCase().includes('password')) {
      return { error: 'Password is too weak. Use at least 6 characters.' };
    }
    return { error: authError.message || 'Unable to create account. Please try again.' };
  }

  if (!authData.user) {
    console.error('[signupAction] auth.signUp succeeded but no user returned');
    return { error: 'Unable to create account. Please try again.' };
  }

  // ── Create authenticated client if session exists (to guarantee RLS compliance)
  const dbClient = authData.session?.access_token
    ? createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${authData.session.access_token}`,
            },
          },
          cookies: {
            getAll() {
              return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options),
                );
              } catch {}
            },
          },
        },
      )
    : supabase;

  // ── 2. Insert profile row ───────────────────────────────────────────────────
  // Safe because auth.uid() matches the newly created user when authenticated.
  // RLS INSERT policy: WITH CHECK (auth.uid() = id)
  const { error: profileError } = await dbClient.from('profiles').insert({
    id:        authData.user.id,
    full_name: fullName,
    phone,
    role,
  });

  if (profileError) {
    console.error('[signupAction] profile insert error:', {
      code: profileError.code,
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
    });
    return { error: `Account created, but profile setup failed: ${profileError.message}` };
  }

  // ── 3. Email confirmation check (must happen before society enrollment) ───────
  // If email confirmation is enabled in Supabase, authData.session will be null.
  // In that case we cannot call enroll_new_member because auth.uid() would be null.
  // Return emailConfirmationRequired so the UI shows the "check your email" screen.
  // Society enrollment will be skipped — the user will complete it after confirming.
  if (!authData.session) {
    return { emailConfirmationRequired: true };
  }

  // ── 4. Create society + membership via controlled RPC (for resident / admin / security) ─────────
  // enroll_new_member() is a SECURITY DEFINER function that:
  //   - Finds existing society by name (case-insensitive) OR creates it
  //   - Creates the society_memberships row for auth.uid()
  // This avoids giving authenticated users direct INSERT on societies while
  // still allowing them to set up their society at signup time.
  // The dbClient carries the Bearer token from authData.session.access_token,
  // so auth.uid() is correctly set inside the RPC.
  if (societyName && (role === 'resident' || role === 'admin' || role === 'security')) {
    const { error: enrollError } = await dbClient.rpc('enroll_new_member', {
      p_society_name: societyName,
      p_block:        block ?? '',
      p_flat_number:  flatNumber ?? '',
      p_city:         'Pune',
      p_state:        'Maharashtra',
    });

    if (enrollError) {
      console.error('[signupAction] enroll_new_member RPC error:', {
        code:    enrollError.code,
        message: enrollError.message,
        details: enrollError.details,
        hint:    enrollError.hint,
      });
      // Surface the error to the user — do not silently continue
      return {
        error: `Account created, but society setup failed: ${enrollError.message}`,
      };
    }
  }

  redirect(roleDestination(role));
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
