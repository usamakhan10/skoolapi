"use client"

// app/signup/page.jsx
// ─────────────────────────────────────────────────────────────
// The registration page. Users enter email + password to create
// their SkoolAPI account. Supabase sends a confirmation email.
// ─────────────────────────────────────────────────────────────

import { useState } from "react"
import { createClient } from "../../lib/supabase/client"

const BG     = "#09090b"
const CARD   = "#111113"
const BORDER = "#27272a"
const T1     = "#fafafa"
const T2     = "#a1a1aa"
const T3     = "#71717a"
const GREEN  = "#22c55e"
const ACCENT = "#6366f1"

export default function SignupPage() {
  const supabase = createClient()

  const [fullName, setFullName]     = useState("")
  const [email, setEmail]           = useState("")
  const [password, setPassword]     = useState("")
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [success, setSuccess]       = useState(false)

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Pass full name so our DB trigger can store it in profiles
        data: { full_name: fullName },
        // After email confirmation, redirect to dashboard
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
  }

  // ── Success state — email sent ────────────────────────────
  if (success) {
    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "48px 40px", maxWidth: 420, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
          <h2 style={{ color: T1, fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Check your email</h2>
          <p style={{ color: T2, fontSize: 14, lineHeight: 1.7 }}>
            We sent a confirmation link to <strong style={{ color: T1 }}>{email}</strong>.
            Click it to activate your account and get your API key.
          </p>
        </div>
      </div>
    )
  }

  // ── Signup form ───────────────────────────────────────────
  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, display: "inline-block" }} />
            <span style={{ fontWeight: 800, fontSize: 18, color: T1, letterSpacing: "-0.02em" }}>SkoolAPI</span>
          </div>
          <h1 style={{ color: T1, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Create your account</h1>
          <p style={{ color: T2, fontSize: 14 }}>Free sandbox · No credit card required</p>
        </div>

        {/* Card */}
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "32px 28px" }}>
          <form onSubmit={handleSignup}>

            {/* Full name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T2, marginBottom: 6 }}>
                Full name
              </label>
              <input
                type="text"
                required
                placeholder="John Smith"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = ACCENT}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>

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
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: T2, marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = ACCENT}
                onBlur={e => e.target.style.borderColor = BORDER}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: "#450a0a", border: "1px solid #991b1b", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#fca5a5" }}>
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
              }}
            >
              {loading ? "Creating account…" : "Create account →"}
            </button>

          </form>
        </div>

        {/* Login link */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: T3 }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: ACCENT, textDecoration: "none", fontWeight: 600 }}>
            Log in
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