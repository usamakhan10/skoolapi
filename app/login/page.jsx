"use client"

// app/login/page.jsx
// ─────────────────────────────────────────────────────────────
// The login page. Users enter email + password to sign in.
// On success, they're redirected to /dashboard.
// ─────────────────────────────────────────────────────────────

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "../../lib/supabase/client"

const BG     = "#09090b"
const CARD   = "#111113"
const BORDER = "#27272a"
const T1     = "#fafafa"
const T2     = "#a1a1aa"
const T3     = "#71717a"
const GREEN  = "#22c55e"
const ACCENT = "#6366f1"

export default function LoginPage() {
  const supabase = createClient()
  const router   = useRouter()

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      // Redirect to dashboard on success
      router.push("/dashboard")
      router.refresh() // ensures server components re-render with new session
    }
  }

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, display: "inline-block" }} />
            <span style={{ fontWeight: 800, fontSize: 18, color: T1, letterSpacing: "-0.02em" }}>SkoolAPI</span>
          </div>
          <h1 style={{ color: T1, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: T2, fontSize: 14 }}>Sign in to your SkoolAPI account</p>
        </div>

        {/* Card */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px 28px" }}>
          <form onSubmit={handleLogin}>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T2, marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = ACCENT}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: T2 }}>Password</label>
                <a href="/forgot-password" style={{ fontSize: 12, color: ACCENT, textDecoration: "none" }}>
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = ACCENT}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "#450a0a", border: "1px solid #991b1b", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#fca5a5", marginTop: 16 }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 0",
                background: loading ? "#3730a3" : ACCENT,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.2s",
                marginTop: 24,
              }}
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>

          </form>
        </div>

        {/* Signup link */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: T3 }}>
          Don&apos;t have an account?{" "}
          <a href="/signup" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>
            Create one free
          </a>
        </p>

      </div>
    </div>
  )
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  background: "#18181b",
  border: "1px solid #27272a",
  borderRadius: 8,
  color: "#fafafa",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
}