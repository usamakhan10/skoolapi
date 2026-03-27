"use client"

// app/dashboard/DashboardShell.js
// ─────────────────────────────────────────────────────────────
// The sidebar + topbar wrapper for all dashboard pages.
// This is a client component so we can handle active nav state
// and the logout button click.
// ─────────────────────────────────────────────────────────────

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "../../lib/supabase/client"

// ── Design tokens ─────────────────────────────────────────────
const BG      = "#09090b"
const SIDEBAR = "#0f0f11"
const CARD    = "#111113"
const BORDER  = "#27272a"
const T1      = "#fafafa"
const T2      = "#a1a1aa"
const T3      = "#52525b"
const GREEN   = "#22c55e"
const ACCENT  = "#6366f1"

// ── Nav items ─────────────────────────────────────────────────
const NAV = [
  { label: "Overview",   href: "/dashboard",            icon: "⊞" },
  { label: "API Keys",   href: "/dashboard/api-keys",   icon: "🔑" },
  { label: "Groups",     href: "/dashboard/groups",      icon: "⬡" },
  { label: "Webhooks",   href: "/dashboard/webhooks",    icon: "⚡" },
  { label: "Logs",       href: "/dashboard/logs",        icon: "📋" },
  { label: "Analytics",  href: "/dashboard/analytics",   icon: "📊" },
  { label: "Settings",   href: "/dashboard/settings",    icon: "⚙" },
]

// ── Plan badge colors ─────────────────────────────────────────
const PLAN_COLORS = {
  starter:    { bg: "#1c1917", text: "#d6d3d1", border: "#44403c" },
  growth:     { bg: "#0f2a1e", text: "#86efac", border: "#166534" },
  agency:     { bg: "#1e1b4b", text: "#a5b4fc", border: "#3730a3" },
  enterprise: { bg: "#1c0a2e", text: "#d8b4fe", border: "#7e22ce" },
}

export default function DashboardShell({ user, profile, children }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const plan       = profile?.plan ?? "starter"
  const planColors = PLAN_COLORS[plan] || PLAN_COLORS.starter
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: BG, fontFamily: "system-ui, -apple-system, sans-serif", color: T1 }}>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? 240 : 64,
        background: SIDEBAR,
        borderRight: `1px solid ${BORDER}`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
      }}>

        {/* Logo */}
        <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, display: "inline-block", flexShrink: 0 }} />
          {sidebarOpen && (
            <span style={{ fontWeight: 800, fontSize: 15, color: T1, letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>
              SkoolAPI
            </span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ marginLeft: "auto", background: "none", border: "none", color: T3, cursor: "pointer", fontSize: 16, flexShrink: 0 }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV.map(item => {
            const isActive = pathname === item.href
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "9px 10px",
                  borderRadius: 8,
                  marginBottom: 2,
                  textDecoration: "none",
                  color: isActive ? T1 : T2,
                  background: isActive ? "#1c1c1f" : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 14,
                  transition: "background 0.15s, color 0.15s",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#18181b" }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent" }}
              >
                <span style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: "center" }}>{item.icon}</span>
                {sidebarOpen && item.label}
              </a>
            )
          })}
        </nav>

        {/* User section at bottom */}
        <div style={{ padding: "12px 8px", borderTop: `1px solid ${BORDER}` }}>
          {/* Plan badge */}
          {sidebarOpen && (
            <div style={{
              background: planColors.bg,
              border: `1px solid ${planColors.border}`,
              borderRadius: 6,
              padding: "5px 10px",
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 11, color: planColors.text, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {plan} plan
              </span>
              <a href="/dashboard/settings" style={{ fontSize: 11, color: T3, textDecoration: "none" }}>Upgrade</a>
            </div>
          )}

          {/* User info + logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 6px" }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: ACCENT, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {displayName[0].toUpperCase()}
            </div>
            {sidebarOpen && (
              <>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {displayName}
                  </div>
                  <div style={{ fontSize: 11, color: T3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.email}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  style={{ background: "none", border: "none", color: T3, cursor: "pointer", fontSize: 16, padding: 4, borderRadius: 4, flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                  onMouseLeave={e => e.currentTarget.style.color = T3}
                >
                  ⏻
                </button>
              </>
            )}
          </div>
        </div>

      </aside>

      {/* ── Main content area ─────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        {children}
      </main>

    </div>
  )
}