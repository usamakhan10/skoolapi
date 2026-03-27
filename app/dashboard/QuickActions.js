"use client"

// app/dashboard/QuickActions.js
// A small client component just for the hover-interactive action links

const BORDER = "#27272a"
const CARD   = "#111113"
const T1     = "#fafafa"
const T3     = "#52525b"
const ACCENT = "#6366f1"

const ACTIONS = [
  { label: "Generate API Key",      href: "/dashboard/api-keys",  icon: "🔑", desc: "Create a new API key"     },
  { label: "Connect a Skool Group", href: "/dashboard/groups",    icon: "⬡",  desc: "Add a community"          },
  { label: "Add Webhook Endpoint",  href: "/dashboard/webhooks",  icon: "⚡", desc: "Subscribe to events"      },
  { label: "View API Logs",         href: "/dashboard/logs",      icon: "📋", desc: "Debug your integration"   },
]

export default function QuickActions() {
  return (
    <div style={{ background: "#111113", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 20 }}>Quick Actions</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ACTIONS.map(action => (
          <a
            key={action.href}
            href={action.href}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 14px", borderRadius: 8,
              border: `1px solid ${BORDER}`, background: "#0f0f11",
              textDecoration: "none", transition: "border-color 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = ACCENT}
            onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
          >
            <span style={{ fontSize: 20 }}>{action.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T1 }}>{action.label}</div>
              <div style={{ fontSize: 12, color: T3 }}>{action.desc}</div>
            </div>
            <span style={{ marginLeft: "auto", color: T3, fontSize: 14 }}>→</span>
          </a>
        ))}
      </div>
    </div>
  )
}