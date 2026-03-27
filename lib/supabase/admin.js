// lib/supabase/admin.js
// ─────────────────────────────────────────────────────────────
// USE THIS only in API Routes / Server Actions that need
// admin-level access (bypasses Row Level Security).
//
// ⚠️  NEVER import this in any client component.
//     NEVER expose SUPABASE_SERVICE_ROLE_KEY to the browser.
//
// Use cases:
//   - Generating & hashing API keys for a user
//   - Writing webhook delivery logs
//   - Stripe webhook handler updating a user's plan
//   - Rate limit enforcement
// ─────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js"

export const adminClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)