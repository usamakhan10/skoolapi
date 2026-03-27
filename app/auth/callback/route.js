// app/auth/callback/route.js
// ─────────────────────────────────────────────────────────────
// Supabase redirects the user HERE after they click the
// confirmation link in their email.
//
// This route exchanges the "code" in the URL for a real
// session, then sends the user to their dashboard.
// ─────────────────────────────────────────────────────────────

import { createClient } from "../../../lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)

  // Supabase puts a "code" param in the URL after email confirmation
  const code  = searchParams.get("code")

  // Where to send the user after — defaults to /dashboard
  const next  = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()

    // Exchange the code for a session (logs the user in)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Success — send to dashboard
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Something went wrong — send to login with an error message
  return NextResponse.redirect(`${origin}/login?error=Could+not+confirm+email`)
}