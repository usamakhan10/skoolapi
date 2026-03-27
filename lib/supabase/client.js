// lib/supabase/client.js
// ─────────────────────────────────────────────────────────────
// USE THIS in Client Components (files with "use client" at top)
// e.g. login forms, signup forms, dashboard UI
// ─────────────────────────────────────────────────────────────

import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}