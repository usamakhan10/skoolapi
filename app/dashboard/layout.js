// app/dashboard/layout.js
// ─────────────────────────────────────────────────────────────
// This wraps ALL dashboard pages with the sidebar + topbar.
// Any file inside /app/dashboard/ will automatically use this.
// ─────────────────────────────────────────────────────────────

import { createClient } from "../../lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardShell from "./DashboardShell"

export const metadata = {
  title: "Dashboard — SkoolAPI",
}

export default async function DashboardLayout({ children }) {
  const supabase = await createClient()

  // Get the logged-in user (server-side)
  const { data: { user } } = await supabase.auth.getUser()

  // If not logged in, send to login
  if (!user) redirect("/login")

  // Get their profile from our profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <DashboardShell user={user} profile={profile}>
      {children}
    </DashboardShell>
  )
}