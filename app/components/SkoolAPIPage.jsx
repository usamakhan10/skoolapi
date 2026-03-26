"use client"

import { useState, useEffect, useRef } from "react"

// ─── DATA ───────────────────────────────────────────────────────────────────

const INTEGRATIONS = [
  { name: "HubSpot", letter: "H", bg: "#ff7a59", fg: "#fff" },
  { name: "Zapier", letter: "Z", bg: "#ff4f00", fg: "#fff" },
  { name: "Make", letter: "M", bg: "#6d00cc", fg: "#fff" },
  { name: "n8n", letter: "n", bg: "#ea4b71", fg: "#fff" },
  { name: "Slack", letter: "S", bg: "#4a154b", fg: "#fff" },
  { name: "Kit", letter: "K", bg: "#fb6970", fg: "#fff" },
  { name: "Mailchimp", letter: "M", bg: "#ffe01b", fg: "#222" },
  { name: "BigQuery", letter: "B", bg: "#4285f4", fg: "#fff" },
  { name: "Notion", letter: "N", bg: "#fff", fg: "#222" },
  { name: "Google Sheets", letter: "G", bg: "#34a853", fg: "#fff" },
]

const TESTIMONIALS = [
  { name: "Sarah M.", role: "Community Manager, CoachIQ", initials: "SM", color: "#10b981", quote: "Replaced our entire Zapier+Sheets stack. member.joined fires, HubSpot updates. Done. We went from 4 separate automations to one webhook endpoint." },
  { name: "Marcus T.", role: "CEO, FitStack", initials: "MT", color: "#818cf8", quote: "Recovered $14K in failed payments in the first month. The payment recovery webhooks are insane. We had no idea how much revenue was leaking." },
  { name: "Alex Rivera", role: "Developer, AgencyOS", initials: "AR", color: "#f59e0b", quote: "Managing 25 client communities from one dashboard. The multi-group API is a game changer. Our agency scaled 3x without adding headcount." },
  { name: "Jordan L.", role: "Ops Lead, SkillForge", initials: "JL", color: "#f472b6", quote: "The analytics Skool should have built. MRR tracking, cohort analysis, churn predictions — all via API. We finally have the data to make real decisions." },
]

const ENDPOINTS = [
  { method: "GET",  route: "/v1/groups/{id}/members", title: "Members", desc: "List, filter, and search members with status, plan, tags, and activity data. Includes timeline events." },
  { method: "POST", route: "/v1/webhooks", title: "Webhooks", desc: "Subscribe to 30+ lifecycle events with automatic retries, delivery logs, and one-click replay." },
  { method: "GET",  route: "/v1/groups/{id}/analytics/mrr", title: "Analytics", desc: "MRR, retention, engagement, and affiliate analytics. Daily snapshots with trend analysis." },
  { method: "POST", route: "/v1/groups/{id}/courses/{cid}/grant-access", title: "Courses", desc: "List courses, grant or revoke access programmatically, and track completion." },
  { method: "GET",  route: "/v1/groups/{id}/posts", title: "Community Posts", desc: "Fetch posts, comments, and replies. Detect unanswered posts and monitor engagement." },
  { method: "GET",  route: "/v1/groups/{id}/moderation/queue", title: "Moderation", desc: "Pending approvals, reported content, spam detection, and bulk moderation actions." },
  { method: "GET",  route: "/v1/groups/{id}/events", title: "Events & Calls", desc: "Create, update, and track Skool events, webinars, and calls. RSVP and attendance tracking." },
  { method: "GET",  route: "/v1/groups/{id}/affiliates", title: "Affiliates", desc: "Track referrals, commissions, and attributed sales. Build affiliate leaderboards." },
]

const WEBHOOK_EVENTS = [
  { name: "member.joined", desc: "New member joins the group. Payload includes profile, source, and membership answers.", timing: "Fires within 30 seconds" },
  { name: "member.trial_started", desc: "Member begins a trial period. Includes trial duration, plan details, and expected conversion date.", timing: "Fires when trial is activated" },
  { name: "member.trial_converted", desc: "Trial member converts to paid. Includes plan, MRR, and payment method. Trigger your onboarding flow.", timing: "Fires on first successful payment" },
  { name: "member.payment_failed", desc: "Payment attempt fails. Includes failure reason, retry schedule, and dunning status.", timing: "Fires immediately on failed charge" },
  { name: "member.churned", desc: "Member cancels or fails to recover payment. Includes churn reason, lifetime value, and membership duration.", timing: "Fires after grace period expires" },
  { name: "post.created", desc: "New post in your community feed. Includes author, category, content preview, and engagement metrics.", timing: "Fires when post is published" },
  { name: "comment.created", desc: "New comment or reply on a post. Includes thread context, author details, and parent post reference.", timing: "Fires on each new comment" },
  { name: "post.reported", desc: "Post flagged by community members. Includes report reason, reporter info, and content snapshot.", timing: "Fires on each report submission" },
]

const PLANS = [
  { name: "Starter", monthly: 29, annual: 23, groups: "1–2 groups", desc: "Perfect for side projects and MVPs.", badge: null, cta: "Get API Key", features: ["Full REST API access", "Webhook subscriptions", "60 req/min rate limit", "30-day log retention", "Community support"] },
  { name: "Growth", monthly: 79, annual: 63, groups: "Up to 5 groups", desc: "Automations, analytics, and CRM sync.", badge: "72% pick this", cta: "Get API Key", features: ["Everything in Starter", "Up to 5 connected groups", "300 req/min rate limit", "Analytics endpoints", "CRM sync (HubSpot, etc.)", "Priority email support"] },
  { name: "Agency", monthly: 199, annual: 159, groups: "Up to 25 groups", desc: "Multi-group rollups, team roles, SLAs.", badge: null, cta: "Get API Key", features: ["Everything in Growth", "Up to 25 connected groups", "1,000 req/min rate limit", "Bulk exports (CSV, JSON)", "Advanced attribution", "Team roles + permissions", "Slack support channel"] },
  { name: "Enterprise", monthly: null, annual: null, groups: "Unlimited groups", desc: "Unlimited groups. SSO, dedicated support.", badge: null, cta: "Contact Sales", features: ["Everything in Agency", "Unlimited groups", "Custom rate limits", "SAML SSO + SCIM", "Custom data retention", "Dedicated account manager", "99.99% SLA"] },
]

const COMPARISON = [
  { name: "Community Posts & Comments API", skool: true, diy: false, other: false },
  { name: "Member Management", skool: true, diy: "partial", other: false },
  { name: "Payment Recovery", skool: true, diy: false, other: false },
  { name: "CRM Sync (HubSpot, Kit, Mailchimp)", skool: true, diy: false, other: "partial" },
  { name: "Real Analytics (MRR, Churn, LTV)", skool: true, diy: false, other: false },
  { name: "Webhooks + Real-Time Events", skool: true, diy: false, other: "partial" },
  { name: "No-Code Automations (Zapier, Make, n8n)", skool: true, diy: false, other: false },
  { name: "Course Automation", skool: true, diy: false, other: false },
  { name: "Moderation Tools", skool: true, diy: false, other: "partial" },
  { name: "Data Exports (CSV, JSON)", skool: true, diy: "partial", other: false },
  { name: "Uptime & Latency", skool: "99.97%, <200ms", diy: false, other: false },
  { name: "Documentation + Playground", skool: "Full", diy: false, other: "Partial" },
]

const FAQS = [
  { q: "Is this the official Skool API?", a: "SkoolAPI Cloud is a hybrid integration layer. We combine official Skool data access with our own normalized API, webhooks, and analytics infrastructure to give you a complete developer platform that Skool doesn't offer natively." },
  { q: "How do I connect my Skool group?", a: "Add your Skool API key in the dashboard, select which groups to connect, and you're live in under 2 minutes. We'll start syncing members, events, and billing data immediately. No code required for setup." },
  { q: "How reliable is webhook delivery?", a: "We guarantee 99.9% webhook delivery with automatic retries using exponential backoff over 72 hours. Every delivery is logged with full request/response details, and you can replay any event from the dashboard." },
  { q: "What are the API rate limits?", a: "Starter: 60 req/min. Growth: 300 req/min. Agency: 1,000 req/min. Enterprise: custom. All plans include burst allowances for short-lived spikes above your base limit." },
  { q: "Which support tier do I get?", a: "Starter: community forum + docs. Growth: priority email (<4hr response). Agency: dedicated Slack channel (<1hr response). Enterprise: dedicated account manager + phone support with custom SLAs." },
  { q: "Do you support no-code tools like Zapier and Make?", a: "Yes. SkoolAPI Cloud integrates natively with Zapier, Make, and n8n. You can trigger workflows from any webhook event without writing code. We also support direct HTTP webhooks for custom integrations." },
  { q: "Which SDKs are available?", a: "Official SDKs for Node.js, Python, and Go — all fully typed and auto-generated from our OpenAPI spec. Community SDKs exist for Ruby and PHP. All SDKs are open source on GitHub." },
  { q: "Can I cancel anytime?", a: "Yes. All plans are month-to-month with no contracts. Cancel anytime from your dashboard. Annual plans can be refunded pro-rata within the first 30 days. Your API keys will work until the end of your billing period." },
  { q: "Is SkoolAPI GDPR compliant?", a: "Yes. We process data under a Data Processing Agreement (DPA), support data export and deletion requests via API, and our infrastructure runs in SOC 2 compliant environments. EU data residency is available on Enterprise plans." },
]

const CODE = `// Sync new Skool members to HubSpot
skoolapi.webhooks.on('member.joined', async (event) => {
  await hubspot.contacts.create({
    email: event.member.email,
    properties: {
      skool_group: event.group.name,
      plan:        event.member.plan,
      source:      event.member.source
    }
  });
  console.log('Synced:', event.member.name);
});`

// ─── HOOKS ───────────────────────────────────────────────────────────────────

function useCountUp(target, duration, active) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = null
    const tick = (ts) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      setVal(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target, duration])
  return val
}

function useInView() {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.2 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return [ref, seen]
}

// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────

const G = "#10b981"   // green accent
const P = "#818cf8"   // purple accent
const A = "#f59e0b"   // amber accent
const BG = "#09090b"
const S1 = "#18181b"
const S2 = "#27272a"
const T1 = "#fafafa"
const T2 = "#a1a1aa"
const T3 = "#52525b"

const c = (...args) => args.filter(Boolean).join(" ")
const px = (x) => `${x}px`

function Dot({ active }) {
  return <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: active ? G : T3, boxShadow: active ? `0 0 6px ${G}` : "none", transition: "all 0.3s" }} />
}

function Check({ val }) {
  if (val === true) return <span style={{ color: G, fontWeight: 700, fontSize: 15 }}>✓</span>
  if (val === false) return <span style={{ color: S2, fontSize: 15 }}>✕</span>
  if (typeof val === "string") return <span style={{ color: T1, fontSize: 12, fontWeight: 500 }}>{val}</span>
  return <span style={{ color: A, fontSize: 15 }}>⚠</span>
}

function Badge({ children, color = G }) {
  return <span style={{ background: color + "18", color, border: `1px solid ${color}30`, fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, letterSpacing: "0.04em" }}>{children}</span>
}

function Method({ m }) {
  const clr = m === "GET" ? G : P
  return <span style={{ background: clr + "18", color: clr, border: `1px solid ${clr}30`, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, fontFamily: "monospace", letterSpacing: "0.05em" }}>{m}</span>
}

function Stars() {
  return <span style={{ color: A, letterSpacing: 1 }}>★★★★★</span>
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: G, background: G + "18", border: `1px solid ${G}30`, padding: "4px 12px", borderRadius: 99, letterSpacing: "0.08em", textTransform: "uppercase" }}>{children}</span>
    </div>
  )
}

function SectionHead({ label, title, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 56 }}>
      {label && <SectionLabel>{label}</SectionLabel>}
      <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.03em", color: T1, marginBottom: 14, lineHeight: 1.15 }}>{title}</h2>
      {sub && <p style={{ fontSize: 17, color: T2, maxWidth: 540, margin: "0 auto", lineHeight: 1.6 }}>{sub}</p>}
    </div>
  )
}

function Btn({ children, primary, href = "#", style = {} }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={href} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: primary ? G : "transparent",
      color: primary ? "#000" : T1,
      fontWeight: 600, fontSize: 14,
      padding: "11px 22px", borderRadius: 10,
      textDecoration: "none",
      border: primary ? "none" : `1px solid ${S2}`,
      opacity: hov ? 0.82 : 1,
      transition: "opacity 0.2s, border-color 0.2s",
      ...style,
    }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</a>
  )
}

function Card({ children, style = {}, hover = false }) {
  const [hov, setHov] = useState(false)
  return (
    <div style={{
      background: S1, border: `1px solid ${hov && hover ? "#3f3f46" : S2}`,
      borderRadius: 14, padding: "24px",
      transition: "border-color 0.2s, transform 0.2s",
      transform: hov && hover ? "translateY(-2px)" : "none",
      ...style,
    }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</div>
  )
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────

function Navbar() {
  const [sc, setSc] = useState(false)
  useEffect(() => {
    const fn = () => setSc(window.scrollY > 20)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
      background: sc ? "rgba(9, 9, 14, 0.9)" : "transparent",
      backdropFilter: sc ? "blur(14px)" : "none",
      borderBottom: `1px solid ${sc ? S2 : "transparent"}`,
      transition: "all 0.3s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#" style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
            <Dot active />
            <span style={{ fontWeight: 800, fontSize: 15, color: T1, letterSpacing: "-0.02em" }}>SkoolAPI</span>
          </a>
          <div style={{ display: "flex", gap: 2, fontSize: 13 }}>
            {["Features", "Use Cases", "Pricing", "Docs"].map(l => {
              const [h, sH] = useState(false)
              return <a key={l} href="#" style={{ padding: "5px 10px", borderRadius: 6, color: h ? T1 : T2, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={() => sH(true)} onMouseLeave={() => sH(false)}>{l}</a>
            })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge color={G}>● ONLINE</Badge>
          <a href="#" style={{ fontSize: 13, color: T2, padding: "5px 10px", textDecoration: "none" }}>Login</a>
          <Btn primary>Get API Key</Btn>
        </div>
      </div>
    </nav>
  )
}

// ─── HERO ────────────────────────────────────────────────────────────────────

function CodeLine({ children }) {
  const parts = children.split(/('.*?'|\/\/.*$|\b(?:async|await|const|let|return|new)\b|\b(?:event|email|group|plan|source|name|member)\b|\b(?:on|create|log)\b)/gm)
  return (
    <div style={{ lineHeight: 1.75 }}>
      {parts.map((p, i) => {
        if (/^'/.test(p)) return <span key={i} style={{ color: G }}>{p}</span>
        if (/^\/\//.test(p)) return <span key={i} style={{ color: T3 }}>{p}</span>
        if (/^(async|await|const|let|return|new)$/.test(p)) return <span key={i} style={{ color: P }}>{p}</span>
        if (/^(event|email|group|plan|source|name|member)$/.test(p)) return <span key={i} style={{ color: "#fbbf24" }}>{p}</span>
        if (/^(on|create|log)$/.test(p)) return <span key={i} style={{ color: "#60a5fa" }}>{p}</span>
        return <span key={i} style={{ color: T2 }}>{p}</span>
      })}
    </div>
  )
}

function Hero() {
  return (
    <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 90, paddingBottom: 80, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, ${S2} 1px, transparent 0)`, backgroundSize: "40px 40px", opacity: 0.5 }} />
      <div style={{ position: "absolute", top: "25%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 400, background: `radial-gradient(ellipse, ${G}14 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", width: "100%", position: "relative", zIndex: 1 }}>
        {/* Top badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: S1, border: `1px solid ${S2}`, borderRadius: 99, padding: "6px 16px", fontSize: 12, color: T2, textDecoration: "none" }}>
            <span style={{ color: G, fontWeight: 700 }}>NEW</span> Now supporting 40+ Skool API endpoints <span style={{ color: G }}>→</span>
          </a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {/* Left */}
          <div>
            <h1 style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.035em", color: T1, marginBottom: 22 }}>
              The Operating System for{" "}
              <span style={{ color: G }}>Skool Communities</span>
            </h1>
            <p style={{ fontSize: 18, color: T2, lineHeight: 1.65, marginBottom: 34, maxWidth: 440 }}>
              Automate member onboarding, recover failed payments, sync to your CRM, and get the analytics Skool doesn't give you.{" "}
              <strong style={{ color: "#d4d4d8", fontWeight: 600 }}>Manage your community like a real business.</strong>
            </p>
            <div style={{ display: "flex", gap: 12, marginBottom: 36, flexWrap: "wrap" }}>
              <Btn primary>Get Your API Key →</Btn>
              <Btn>View Documentation</Btn>
            </div>
            {/* Social proof */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex" }}>
                {[78,14,10,44,96].map((n,i) => (
                  <img key={n} src={`https://randomuser.me/api/portraits/men/${n}.jpg`} alt="" style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${BG}`, marginLeft: i ? -8 : 0, objectFit: "cover" }} />
                ))}
              </div>
              <span style={{ fontSize: 13 }}><strong style={{ color: T1, fontWeight: 700 }}>2,400+</strong> <span style={{ color: T3 }}>groups connected</span></span>
              <span style={{ color: S2 }}>·</span>
              <Stars />
              <span style={{ color: T3, fontSize: 12 }}>4.8 / 5</span>
            </div>
          </div>

          {/* Code card */}
          <div style={{ background: "#0d0d0f", border: `1px solid ${S2}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 40px 100px rgba(0,0,0,0.6)" }}>
            <div style={{ padding: "11px 16px", background: S1, borderBottom: `1px solid ${S2}`, display: "flex", alignItems: "center", gap: 7 }}>
              {["#ef4444","#f59e0b","#22c55e"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
              <span style={{ marginLeft: 6, fontSize: 11, color: T3, fontFamily: "monospace" }}>skoolapi-webhook.js</span>
            </div>
            <pre style={{ padding: "20px", margin: 0, fontSize: 12, lineHeight: 1.7, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", overflow: "auto" }}>
              {CODE.split("\n").map((ln, i) => <CodeLine key={i}>{ln || " "}</CodeLine>)}
            </pre>
            <div style={{ padding: "10px 16px", borderTop: `1px solid ${S2}`, display: "flex", gap: 7, flexWrap: "wrap" }}>
              {["Member Management", "Payment Recovery", "CRM Sync", "Real Analytics", "Automations"].map(t => (
                <span key={t} style={{ fontSize: 10, color: T3, background: S2 + "80", padding: "3px 8px", borderRadius: 4, fontWeight: 500 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: 48, fontSize: 12, color: T3 }}>No credit card required · Free sandbox · Ships in 2 minutes</p>
      </div>
    </section>
  )
}

// ─── STATS ───────────────────────────────────────────────────────────────────

function StatCard({ value, suffix, label, active }) {
  const count = useCountUp(value, 2200, active)
  const display = value >= 1000000 ? `${(count / 1000000).toFixed(1)}B+` : count >= 1000 ? `${(count / 1000).toFixed(1)}K+` : `${count}${suffix}`
  return (
    <div style={{ textAlign: "center", padding: "32px 16px" }}>
      <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: "-0.04em", color: T1, lineHeight: 1 }}>{display}</div>
      <div style={{ fontSize: 13, color: T3, marginTop: 10, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function Stats() {
  const [ref, seen] = useInView()
  return (
    <section ref={ref} style={{ background: S1, borderTop: `1px solid ${S2}`, borderBottom: `1px solid ${S2}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
        {[
          { value: 1200000000, suffix: "", label: "Events delivered" },
          { value: 2400, suffix: "+", label: "Connected groups" },
          { value: 99.97, suffix: "%", label: "Uptime SLA" },
          { value: 200, suffix: "ms", label: "p95 latency" },
        ].map((s, i) => (
          <div key={i} style={{ borderRight: i < 3 ? `1px solid ${S2}` : "none" }}>
            <StatCard {...s} active={seen} />
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── INTEGRATIONS MARQUEE ────────────────────────────────────────────────────

function Marquee() {
  const items = [...INTEGRATIONS, ...INTEGRATIONS]
  return (
    <section style={{ padding: "60px 0", overflow: "hidden" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ fontSize: 13, color: T3, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>Integrates with your stack</p>
      </div>
      <div style={{ display: "flex", gap: 20, animation: "marquee 28s linear infinite", width: "max-content" }}>
        {items.map((int, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: S1, border: `1px solid ${S2}`, borderRadius: 10, padding: "10px 18px", whiteSpace: "nowrap", flexShrink: 0 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: int.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: int.fg }}>{int.letter}</div>
            <span style={{ fontSize: 13, color: T2, fontWeight: 500 }}>{int.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── TESTIMONIALS ────────────────────────────────────────────────────────────

function Testimonials() {
  return (
    <section style={{ padding: "100px 0", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <SectionHead label="What operators are saying" title="Trusted by community operators worldwide" sub="Real results from teams building on SkoolAPI Cloud." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} hover>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: "50%", background: t.color + "22", border: `2px solid ${t.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: t.color, flexShrink: 0 }}>{t.initials}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T1 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: T3 }}>{t.role}</div>
                </div>
                <Stars />
              </div>
              <p style={{ fontSize: 14, color: T2, lineHeight: 1.7, margin: 0 }}>"{t.quote}"</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── ENDPOINTS ───────────────────────────────────────────────────────────────

function Endpoints() {
  return (
    <section style={{ padding: "100px 0", background: S1 + "80" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <SectionHead label="API Endpoints" title="40+ endpoints. One consistent interface." sub="Members, billing, courses, analytics, webhooks — all normalized with predictable pagination, filtering, and error handling." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          {ENDPOINTS.map((ep, i) => (
            <Card key={i} hover style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Method m={ep.method} />
                <code style={{ fontSize: 11, color: T3, fontFamily: "monospace", background: S2 + "60", padding: "3px 8px", borderRadius: 4 }}>{ep.route}</code>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: T1, marginBottom: 6 }}>{ep.title}</div>
              <div style={{ fontSize: 13, color: T2, lineHeight: 1.6 }}>{ep.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── COMPARISON TABLE ────────────────────────────────────────────────────────

function ComparisonTable() {
  const cols = ["SkoolAPI Cloud", "Manual / DIY", "Other Tools"]
  return (
    <section style={{ padding: "100px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <SectionHead label="Why SkoolAPI" title="SkoolAPI vs DIY vs Other Tools" sub="Stop duct-taping. See what a real platform gives you." />
        <div style={{ background: S1, border: `1px solid ${S2}`, borderRadius: 16, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: `1px solid ${S2}` }}>
            <div style={{ padding: "14px 20px" }} />
            {cols.map((c, i) => (
              <div key={i} style={{ padding: "14px 16px", textAlign: "center", background: i === 0 ? G + "10" : "transparent", borderLeft: `1px solid ${S2}` }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? G : T2 }}>{c}</span>
              </div>
            ))}
          </div>
          {/* Rows */}
          {COMPARISON.map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: i < COMPARISON.length - 1 ? `1px solid ${S2}` : "none", background: i % 2 === 1 ? S2 + "20" : "transparent" }}>
              <div style={{ padding: "13px 20px", fontSize: 13, color: T2 }}>{row.name}</div>
              {[row.skool, row.diy, row.other].map((v, j) => (
                <div key={j} style={{ padding: "13px 16px", textAlign: "center", borderLeft: `1px solid ${S2}`, background: j === 0 ? G + "08" : "transparent" }}>
                  <Check val={v} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── HOW IT WORKS ────────────────────────────────────────────────────────────

function HowItWorks() {
  const STEPS = [
    { n: "1", title: "Connect your Skool group", desc: "Add your API key in the dashboard. Select which groups to connect. Live in under 2 minutes with full member, billing, and course data synced." },
    { n: "2", title: "Subscribe to webhook events", desc: "Pick from 40+ lifecycle events: member.joined, trial_converted, payment_failed, post.created, and more. We handle retries and logging." },
    { n: "3", title: "Build your integration", desc: "Use our Node.js, Python, or Go SDK — or hit the REST API directly. Typed responses, predictable pagination, and a playground to test before shipping." },
  ]
  const WITHOUT = [
    "Scrape Skool with browser automation (breaks monthly)",
    "Pipe data through 4 Zapier zaps ($60+/mo in Zapier fees alone)",
    "Export CSVs manually and paste into Google Sheets",
    "No webhooks — poll or check manually for changes",
    "Different data shapes from every integration",
    "No logs, no retries, no visibility when things break",
    "Spend weekends debugging instead of building product",
  ]
  const [tab, setTab] = useState("with")
  return (
    <section style={{ padding: "100px 0", background: S1 + "60" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <SectionHead label="How it works" title="How SkoolAPI Replaces Your Duct-Tape Stack" sub="Stop stitching together Zapier, spreadsheets, and browser scripts. Get a real API." />
        {/* Tab toggle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 48 }}>
          <div style={{ display: "flex", background: S2 + "60", borderRadius: 10, padding: 4, gap: 2 }}>
            {[["with","With SkoolAPI"],["without","Without SkoolAPI"]].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ padding: "8px 20px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === k ? (k === "with" ? G : "#ef4444") : "transparent", color: tab === k ? (k === "with" ? "#000" : "#fff") : T2, transition: "all 0.2s" }}>{l}</button>
            ))}
          </div>
        </div>
        {tab === "with" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
            {STEPS.map((s,i) => (
              <Card key={i} style={{ borderTop: `2px solid ${G}` }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: G + "20", border: `2px solid ${G}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: G, marginBottom: 16 }}>{s.n}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T1, marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: T2, lineHeight: 1.7 }}>{s.desc}</div>
              </Card>
            ))}
          </div>
        ) : (
          <div style={{ background: S1, border: `1px solid #ef444440`, borderRadius: 16, padding: 32, maxWidth: 720, margin: "0 auto" }}>
            {WITHOUT.map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingBottom: 14, marginBottom: i < WITHOUT.length - 1 ? 0 : 0 }}>
                <span style={{ color: "#ef4444", fontSize: 16, flexShrink: 0, marginTop: 1 }}>✕</span>
                <span style={{ fontSize: 14, color: T2, lineHeight: 1.6 }}>{w}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Btn primary>Get Your API Key</Btn>
        </div>
      </div>
    </section>
  )
}

// ─── WEBHOOK EVENTS ──────────────────────────────────────────────────────────

function WebhookEvents() {
  return (
    <section style={{ padding: "100px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <SectionHead label="Webhook Events" title="Every community event, delivered in real time" sub="Members, payments, posts, comments, courses, moderation — subscribe to the events that matter." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          {WEBHOOK_EVENTS.map((ev, i) => (
            <Card key={i} hover style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <code style={{ fontSize: 13, fontWeight: 700, color: G, fontFamily: "monospace" }}>{ev.name}</code>
                <span style={{ fontSize: 10, color: T3, background: S2 + "60", padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0 }}>{ev.timing}</span>
              </div>
              <p style={{ fontSize: 13, color: T2, lineHeight: 1.6, margin: 0 }}>{ev.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── PLATFORM FEATURES ───────────────────────────────────────────────────────

function PlatformFeatures() {
  const FEATS = [
    { icon: "⚡", title: "Dashboard + Logs", desc: "Real-time event throughput, webhook delivery stats, and searchable request logs. See every API call with full request/response details." },
    { icon: "🔁", title: "Webhooks + Replay", desc: "30+ lifecycle events with automatic retries (exponential backoff, 72 hours). One-click replay for any failed delivery. Signed payloads with HMAC verification." },
    { icon: "📦", title: "SDK + Playground", desc: "Official SDKs for Node.js, Python, and Go — fully typed and auto-generated from our OpenAPI spec. Interactive playground to test any endpoint before writing code." },
    { icon: "📊", title: "Exports + Sync", desc: "Bulk export members, billing, and analytics to CSV or JSON. Set up continuous sync to BigQuery, Airtable, or S3 for warehouse-native analytics." },
  ]
  return (
    <section style={{ padding: "100px 0", background: S1 + "60" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <SectionHead label="Platform features" title="Everything you need to build on Skool" sub="A complete developer platform — not just an API. Logs, SDKs, a playground, and the tooling you'd expect from Stripe or Twilio." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
          {FEATS.map((f, i) => (
            <Card key={i} hover style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div style={{ fontSize: 24, flexShrink: 0, width: 44, height: 44, background: G + "18", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T1, marginBottom: 8 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: T2, lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── DASHBOARD PREVIEW ───────────────────────────────────────────────────────

function DashboardPreview() {
  const [tab, setTab] = useState(0)
  const TABS = ["Dashboard", "Member Management", "Analytics"]
  const MEMBERS = [
    { name: "Sarah Chen", status: "Active", mrr: "$49", color: G },
    { name: "Marcus Johnson", status: "Failed", mrr: "$99", color: "#ef4444" },
    { name: "Alex Rivera", status: "Trial", mrr: "$0", color: A },
    { name: "Jordan Kim", status: "Active", mrr: "$199", color: G },
  ]
  return (
    <section style={{ padding: "100px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <SectionHead label="See it in action" title="Built for developers who ship" sub="A dashboard, docs, and webhook management interface you'll actually enjoy using." />
        {/* Tab switcher */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: S1, border: `1px solid ${S2}`, borderRadius: 10, padding: 4, width: "fit-content", margin: "0 auto 24px" }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: tab === i ? G : "transparent", color: tab === i ? "#000" : T2, transition: "all 0.2s" }}>{t}</button>
          ))}
        </div>
        {/* Mock dashboard */}
        <div style={{ background: S1, border: `1px solid ${S2}`, borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
          {/* Top bar */}
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${S2}`, display: "flex", alignItems: "center", gap: 8 }}>
            <Dot active />
            <span style={{ fontSize: 12, color: T3, fontFamily: "monospace" }}>Community Dashboard</span>
          </div>
          <div style={{ padding: "28px" }}>
            {tab === 0 && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
                  {[["Connected Groups","24",G],["Events Today","8.2K",P],["Monthly MRR","$128K",A],["Churn Rate","3.2%","#ef4444"]].map(([l,v,c]) => (
                    <div key={l} style={{ background: BG, border: `1px solid ${S2}`, borderRadius: 12, padding: "18px 20px" }}>
                      <div style={{ fontSize: 11, color: T3, marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: c, letterSpacing: "-0.03em" }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: BG, border: `1px solid ${S2}`, borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 12, color: T3, marginBottom: 16, fontWeight: 500 }}>Event throughput (24h)</div>
                  <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 80 }}>
                    {[40,60,35,80,55,90,70,85,45,75,65,95,50,88,72,60,78,55,82,68,90,75,85,92].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: G + (i === 23 ? "ff" : "55"), borderRadius: "2px 2px 0 0", transition: "height 0.5s" }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {tab === 1 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T1 }}>Members</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: 12, color: T3, background: S2, padding: "5px 12px", borderRadius: 6 }}>Filter</span>
                    <span style={{ fontSize: 12, color: T3, background: S2, padding: "5px 12px", borderRadius: 6 }}>Export</span>
                  </div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${S2}` }}>
                      {["Name","Status","Plan","MRR","Joined"].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 11, color: T3, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {MEMBERS.map((m, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${S2}20` }}>
                        <td style={{ padding: "12px", fontSize: 13, color: T1, fontWeight: 500 }}>{m.name}</td>
                        <td style={{ padding: "12px" }}><Badge color={m.color}>{m.status}</Badge></td>
                        <td style={{ padding: "12px", fontSize: 12, color: T3 }}>Growth</td>
                        <td style={{ padding: "12px", fontSize: 13, color: m.color, fontWeight: 600, fontFamily: "monospace" }}>{m.mrr}</td>
                        <td style={{ padding: "12px", fontSize: 12, color: T3 }}>Mar {i + 10}, 2026</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {tab === 2 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
                {[["MRR Growth (30d)","+12.3%",G],["Retention Rate","94.2%",P],["Avg LTV","$1,847",A],["Payment Recovery","71.4%",G]].map(([l,v,c]) => (
                  <div key={l} style={{ background: BG, border: `1px solid ${c}30`, borderRadius: 12, padding: "22px 24px" }}>
                    <div style={{ fontSize: 11, color: T3, marginBottom: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: c, letterSpacing: "-0.04em" }}>{v}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── PRICING ─────────────────────────────────────────────────────────────────

function Pricing() {
  const [annual, setAnnual] = useState(false)
  return (
    <section style={{ padding: "100px 0", background: S1 + "60" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Stars />
          <p style={{ fontSize: 12, color: T3, marginTop: 4 }}>Rated 4.8 out of 5 with 127 reviews on Trustpilot</p>
        </div>
        <SectionHead title="Simple pricing. No surprises." sub="Pick a plan that matches your group count. All plans include the full API, webhooks, and logs." />
        {/* Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 52 }}>
          <span style={{ fontSize: 13, color: annual ? T3 : T1, fontWeight: 500 }}>Monthly</span>
          <button onClick={() => setAnnual(!annual)} style={{ width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer", position: "relative", background: annual ? G : S2, transition: "background 0.25s" }}>
            <span style={{ position: "absolute", top: 3, left: annual ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.25s" }} />
          </button>
          <span style={{ fontSize: 13, color: annual ? T1 : T3, fontWeight: 500 }}>Annual</span>
          {annual && <Badge color={G}>Save 20%</Badge>}
        </div>
        {/* Plan cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {PLANS.map((plan, i) => {
            const price = annual ? plan.annual : plan.monthly
            const featured = plan.badge !== null
            return (
              <div key={i} style={{ background: S1, border: `${featured ? 2 : 1}px solid ${featured ? G : S2}`, borderRadius: 16, padding: "28px 24px", display: "flex", flexDirection: "column", position: "relative", transition: "border-color 0.2s" }}>
                {plan.badge && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: G, color: "#000", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 99, whiteSpace: "nowrap" }}>{plan.badge}</div>
                )}
                <div style={{ fontSize: 16, fontWeight: 800, color: T1, marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: T3, marginBottom: 20 }}>{plan.groups}</div>
                {price !== null ? (
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.04em", color: T1 }}>${price}</span>
                    <span style={{ fontSize: 13, color: T3 }}> /mo</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 32, fontWeight: 800, color: T1, marginBottom: 6 }}>Custom</div>
                )}
                <div style={{ fontSize: 13, color: T2, marginBottom: 24, lineHeight: 1.5 }}>{plan.desc}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>What's included:</div>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, marginBottom: 28, flex: 1 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: T2, marginBottom: 8 }}>
                      <span style={{ color: G, marginTop: 1, flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Btn primary={featured} style={{ justifyContent: "center", fontSize: 13 }}>{plan.cta}</Btn>
                <div style={{ textAlign: "center", fontSize: 11, color: T3, marginTop: 10 }}>30-day money-back guarantee</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <section style={{ padding: "100px 0" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
        <SectionHead title="Frequently Asked Questions" sub="Everything you need to know about SkoolAPI Cloud." />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: S1, border: `1px solid ${open === i ? S2 + "cc" : S2}`, borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", gap: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: T1 }}>{faq.q}</span>
                <span style={{ color: open === i ? G : T3, fontSize: 18, flexShrink: 0, transition: "transform 0.2s, color 0.2s", transform: open === i ? "rotate(45deg)" : "none" }}>+</span>
              </button>
              {open === i && (
                <div style={{ padding: "0 20px 18px", fontSize: 14, color: T2, lineHeight: 1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── INFRASTRUCTURE ──────────────────────────────────────────────────────────

function Infrastructure() {
  const CARDS = [
    { icon: "🛡", title: "99.97% API Uptime SLA", desc: "Multi-region deployment with automatic failover. If we miss our SLA, you get service credits automatically. No ticket required." },
    { icon: "🔒", title: "Data Privacy First", desc: "Your data is encrypted at rest and in transit. We never sell member data. Full DPA available. Data deletion on request within 24 hours." },
    { icon: "✅", title: "SOC 2 Type II Compliant", desc: "Annual third-party audits of our security controls, access management, and data handling. Audit reports available for Enterprise customers." },
  ]
  return (
    <section style={{ padding: "80px 0", background: S1 + "60" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <SectionHead label="Security & reliability" title="Infrastructure You Can Trust" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {CARDS.map((c, i) => (
            <Card key={i} style={{ borderTop: `2px solid ${G}` }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{c.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 10 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: T2, lineHeight: 1.7 }}>{c.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FINAL CTA ───────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section style={{ padding: "120px 0" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          {[78,14,44,10].map((n,i) => (
            <img key={n} src={`https://randomuser.me/api/portraits/men/${n}.jpg`} alt="" style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${BG}`, marginLeft: i ? -10 : 0, objectFit: "cover" }} />
          ))}
        </div>
        <Stars />
        <p style={{ fontSize: 12, color: T3, marginTop: 4, marginBottom: 32 }}>4.8 on Trustpilot</p>
        <h2 style={{ fontSize: 46, fontWeight: 800, letterSpacing: "-0.035em", color: T1, lineHeight: 1.1, marginBottom: 20 }}>Stop duct-taping.<br />Start building.</h2>
        <p style={{ fontSize: 17, color: T2, marginBottom: 40, lineHeight: 1.6 }}>Join 2,400+ connected groups using SkoolAPI Cloud to power their Skool integrations.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn primary style={{ fontSize: 15, padding: "14px 28px" }}>Get Your API Key →</Btn>
        </div>
        <p style={{ fontSize: 12, color: T3, marginTop: 16 }}>30-day money-back guarantee · No credit card for sandbox</p>
      </div>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────

function Footer() {
  const COLS = [
    { title: "Product", links: ["Dashboard","API Keys","Webhooks","Playground","Changelog"] },
    { title: "Developers", links: ["Documentation","API Reference","SDKs","Examples","Status Page"] },
    { title: "Use Cases", links: ["CRM Sync","Agency Ops","Revenue Ops","Churn Recovery","Course Automation"] },
    { title: "Legal", links: ["Terms","Privacy","DPA","Security","GDPR"] },
  ]
  return (
    <footer style={{ borderTop: `1px solid ${S2}`, padding: "60px 24px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <Dot active />
              <span style={{ fontWeight: 800, fontSize: 15, color: T1, letterSpacing: "-0.02em" }}>SkoolAPI</span>
            </div>
            <p style={{ fontSize: 13, color: T3, lineHeight: 1.7, maxWidth: 220, marginBottom: 16 }}>The control plane for Skool operators. API + webhooks + analytics + automation.</p>
            <Badge color={G}>System Status: ONLINE</Badge>
          </div>
          {COLS.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T1, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>{col.title}</div>
              {col.links.map(l => (
                <a key={l} href="#" style={{ display: "block", fontSize: 13, color: T3, textDecoration: "none", marginBottom: 8, transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = T2} onMouseLeave={e => e.target.style.color = T3}>{l}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${S2}`, paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: T3 }}>© 2026 SkoolAPI Cloud · All Rights Reserved</span>
          <span style={{ fontSize: 12, color: T3 }}>skoolapi.co</span>
        </div>
      </div>
    </footer>
  )
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div style={{ background: BG, minHeight: "100vh", color: T1, fontFamily: "-apple-system, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #18181b; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 99px; }
        a { color: inherit; }
        button { font-family: inherit; }
        pre { overflow-x: auto; }
      `}</style>
      <Navbar />
      <Hero />
      <Stats />
      <Marquee />
      <Testimonials />
      <Endpoints />
      <ComparisonTable />
      <HowItWorks />
      <WebhookEvents />
      <PlatformFeatures />
      <DashboardPreview />
      <Pricing />
      <FAQ />
      <Infrastructure />
      <FinalCTA />
      <Footer />
    </div>
  )
}