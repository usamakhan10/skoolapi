// lib/supabase/server.js
// ─────────────────────────────────────────────────────────────
// USE THIS in Server Components, API Routes, and Server Actions
// e.g. fetching user data, protecting pages, API handlers
// ─────────────────────────────────────────────────────────────

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()  // ← Next.js 16 requires await here

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — cookies can't be set here.
            // This is fine, middleware handles session refresh.
          }
        },
      },
    }
  )
}