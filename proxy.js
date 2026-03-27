// proxy.js  ← place this in the ROOT of your project (same level as package.json)
// ─────────────────────────────────────────────────────────────
// In Next.js 16, "middleware.js" was renamed to "proxy.js"
// Same functionality — runs before every request:
//   1. Refreshes the Supabase session automatically
//   2. Protects /dashboard — redirects to /login if not signed in
// ─────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function proxy(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do NOT remove this
  const { data: { user } } = await supabase.auth.getUser()

  // ── Protect /dashboard/* ──────────────────────────────────
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard")
  if (isDashboard && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    return NextResponse.redirect(loginUrl)
  }

  // ── Redirect logged-in users away from /login and /signup ─
  const isAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup"
  if (isAuthPage && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = "/dashboard"
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth/callback).*)",
  ],
}