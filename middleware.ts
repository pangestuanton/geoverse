import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Route definitions
const PUBLIC_PREFIXES = ["/", "/login", "/auth"];
const USER_PREFIXES = ["/dashboard", "/green-log", "/learn", "/profile", "/badges", "/challenges", "/setup-profile"];
const ADMIN_PREFIXES = ["/admin"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Next.js internals — pass through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/_next") ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$/.test(pathname)
  ) {
    return NextResponse.next({ request });
  }

  // Public routes (/, /login, /auth/*) — always allow
  if (matchesPrefix(pathname, PUBLIC_PREFIXES)) {
    return refreshSession(request);
  }

  // Protected routes — require session
  if (
    matchesPrefix(pathname, USER_PREFIXES) ||
    matchesPrefix(pathname, ADMIN_PREFIXES)
  ) {
    const { response, user } = await getSessionAndRefresh(request);

    if (!user) {
      // Tidak ada session → redirect ke login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  return NextResponse.next({ request });
}

/**
 * Refresh session cookies tanpa blocking (untuk public routes)
 */
function refreshSession(request: NextRequest): NextResponse {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vcaqoepveroxvreswycv.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_J1U0_Z2aDBvBZ50EsGoMtg_N-r4c5vq";

  createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  return response;
}

/**
 * Get session & refresh cookies
 */
async function getSessionAndRefresh(request: NextRequest): Promise<{
  response: NextResponse;
  user: { id: string; email?: string } | null;
}> {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vcaqoepveroxvreswycv.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_J1U0_Z2aDBvBZ50EsGoMtg_N-r4c5vq";

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
