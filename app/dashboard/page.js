// app/dashboard/page.js
// Server component — fetches data, no event handlers here.

import { createClient } from "../../lib/supabase/server"
import { redirect } from "next/navigation"
import QuickActions from "./QuickActions"

const BORDER = "#27272a"
const CARD   = "#111113"
const T1     = "#fafafa"
const T2     = "#a1a1aa"
const T3     = "#52525b"
const GREEN  = "#22c55e"
const ACCENT = "#6366f1"
const RED    = "#ef4444"
const YELLOW = "#f59e0b"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [
    { data: profile },
    { data: apiKeys },
    { data: groups },
    { data: webhooks },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("api_keys").select("*").eq("user_id", user.id).eq("status", "active"),
    supabase.from("connected_groups").select("*").eq("user_id", user.id),
    supabase.from("webhook_subscriptions").select("*").eq("user_id", user.id).eq("is_active", true),
    supabase.from("event_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5),
  ])

  const displayName = profile?.full_name || user.email.split("@")[0]
  const plan        = profile?.plan ?? "starter"
  const maxGroups   = profile?.max_groups ?? 2

  const stats = [
    { label: "Connected Groups",   value: groups?.length ?? 0,   sub: `${maxGroups - (groups?.length ?? 0)} slots remaining`,  icon: "⬡"  },
    { label: "Active API Keys",    value: apiKeys?.length ?? 0,  sub: "Click API Keys to manage",                              icon: "🔑" },
    { label: "Active Webhooks",    value: webhooks?.length ?? 0, sub: "Subscriptions live",                                    icon: "⚡" },
    { label: "API Requests Today", value: 0,                     sub: `Rate limit: ${profile?.rate_limit_rpm ?? 60} req/min`,  icon: "📈" },
  ]

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1100 }}>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: T1, letterSpacing: "-0.03em", marginBottom: 6 }}>
          Good morning, {displayName} 👋
        </h1>
        <p style={{ color: T2, fontSize: 14 }}>Here&apos;s what&apos;s happening with your SkoolAPI account.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: T2, fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: T1, letterSpacing: "-0.04em", marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: T3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        <QuickActions />

        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Recent Requests</h2>
            <a href="/dashboard/logs" style={{ fontSize: 12, color: ACCENT, textDecoration: "none" }}>View all →</a>
          </div>
          {recentLogs && recentLogs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentLogs.map(log => (
                <div key={log.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 8, background: "#0f0f11", border: `1px solid ${BORDER}` }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, background: log.status_code < 300 ? GREEN : log.status_code < 500 ? YELLOW : RED }} />
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: log.method === "GET" ? "#1e3a5f" : "#2d1b69", color: log.method === "GET" ? "#7dd3fc" : "#c4b5fd", flexShrink: 0 }}>{log.method}</span>
                  <span style={{ fontSize: 12, color: T2, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.path}</span>
                  <span style={{ fontSize: 12, color: log.status_code < 300 ? GREEN : RED, flexShrink: 0 }}>{log.status_code}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
              <p style={{ color: T3, fontSize: 13 }}>No API requests yet.</p>
              <p style={{ color: T3, fontSize: 12, marginTop: 4 }}>Generate an API key and make your first request.</p>
            </div>
          )}
        </div>

      </div>

      {plan === "starter" && (
        <div style={{ marginTop: 24, background: "linear-gradient(135deg, #1e1b4b, #0f0f11)", border: "1px solid #3730a3", borderRadius: 12, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T1, marginBottom: 4 }}>You&apos;re on the Starter plan</div>
            <div style={{ fontSize: 13, color: T2 }}>Connect up to 2 groups · 60 req/min · Upgrade for analytics & CRM sync</div>
          </div>
          <a href="/dashboard/settings" style={{ padding: "9px 18px", background: ACCENT, color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 700, flexShrink: 0, marginLeft: 24 }}>
            Upgrade Plan →
          </a>
        </div>
      )}

    </div>
  )
}