import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser (client-side) Supabase client.
 * Safe to call in 'use client' components.
 * Uses only the public anon key — never a secret.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
