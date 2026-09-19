import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * AavaasIQ — Route protection proxy (Next.js 16)
 *
 * In Next.js 16, middleware.ts is renamed to proxy.ts.
 *
 * Security Architecture:
 * - The database `profiles.role` column is the single authoritative source of truth.
 * - Client-controlled `user_metadata` is explicitly NOT trusted for authorization
 *   or cross-role route protection to prevent privilege escalation.
 * - Unauthenticated users are redirected to /login.
 * - Authenticated users are restricted strictly to their assigned role portal
 *   as verified from the database profiles table.
 */

// Route groups that require authentication
const PROTECTED_PREFIXES = ['/resident', '/admin', '/security', '/provider'] as const;

// Portals each role is permitted to access
const ROLE_PORTAL: Record<string, string> = {
  resident: '/resident',
  admin:    '/admin',
  security: '/security',
  provider: '/provider',
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a mutable response that we'll return (may have refreshed session cookies)
  let response = NextResponse.next({ request });

  // Create a Supabase server client that reads/writes cookies on this request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write refreshed tokens both to the outgoing request and response
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() validates the JWT and refreshes the session if expired.
  // We use getUser() (not getSession()) for secure server-side validation.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtectedRoute = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute      = pathname === '/login' || pathname === '/signup';

  // ── 1. Unauthenticated user trying to access a protected portal ────────────
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ── 2. Retrieve authoritative role from database profiles table ────────────
  // DO NOT trust user_metadata which can be modified by the client.
  let trustedRole: string | null = null;
  if (user) {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!error && profile?.role && ROLE_PORTAL[profile.role]) {
        trustedRole = profile.role;
      }
    } catch {
      trustedRole = null;
    }
  }

  // ── 3. Authenticated user accessing protected portal without a valid role ──
  if (isProtectedRoute && user && !trustedRole) {
    // Cannot verify role from database profiles table — deny access to protected areas
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ── 4. Authenticated user trying to access login or signup ─────────────────
  if (isAuthRoute && user && trustedRole) {
    const portalRoot = ROLE_PORTAL[trustedRole];
    return NextResponse.redirect(new URL(`${portalRoot}/dashboard`, request.url));
  }

  // ── 5. Authenticated user accessing the wrong role's portal ────────────────
  if (isProtectedRoute && user && trustedRole) {
    const allowedPortal = ROLE_PORTAL[trustedRole];
    if (!pathname.startsWith(allowedPortal)) {
      return NextResponse.redirect(new URL(`${allowedPortal}/dashboard`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every route EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public assets (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
