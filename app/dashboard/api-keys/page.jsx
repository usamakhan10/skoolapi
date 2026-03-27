"use client"

// app/dashboard/api-keys/page.jsx
// ─────────────────────────────────────────────────────────────
// The API Keys management page.
// Users can: create keys, see all their keys, copy prefix,
// rename keys, and revoke keys.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from "react"

const BG     = "#09090b"
const CARD   = "#111113"
const BORDER = "#27272a"
const T1     = "#fafafa"
const T2     = "#a1a1aa"
const T3     = "#52525b"
const GREEN  = "#22c55e"
const ACCENT = "#6366f1"
const RED    = "#ef4444"

export default function ApiKeysPage() {
  const [keys, setKeys]             = useState([])
  const [loading, setLoading]       = useState(true)
  const [creating, setCreating]     = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [showForm, setShowForm]     = useState(false)
  const [newKeyValue, setNewKeyValue] = useState(null)  // shown once after creation
  const [copied, setCopied]         = useState(false)
  const [error, setError]           = useState(null)

  // ── Load keys on mount ────────────────────────────────────
  useEffect(() => { fetchKeys() }, [])

  async function fetchKeys() {
    setLoading(true)
    const res  = await fetch("/api/keys")
    const data = await res.json()
    setKeys(data.keys || [])
    setLoading(false)
  }

  // ── Create a new key ──────────────────────────────────────
  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setError(null)

    const res  = await fetch("/api/keys", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name: newKeyName || "My API Key" }),
    })
    const data = await res.json()
    setCreating(false)

    if (!res.ok) {
      setError(data.error)
      return
    }

    // Show the full key once, then refresh the list
    setNewKeyValue(data.key)
    setNewKeyName("")
    setShowForm(false)
    fetchKeys()
  }

  // ── Revoke a key ──────────────────────────────────────────
  async function handleRevoke(id) {
    if (!confirm("Revoke this key? Any apps using it will stop working immediately.")) return

    const res = await fetch(`/api/keys/${id}`, { method: "DELETE" })
    if (res.ok) fetchKeys()
  }

  // ── Copy to clipboard ─────────────────────────────────────
  async function handleCopy(text) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Format date ───────────────────────────────────────────
  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 900 }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: T1, letterSpacing: "-0.03em", marginBottom: 6 }}>API Keys</h1>
          <p style={{ color: T2, fontSize: 14 }}>
            Keys authenticate your API requests. Keep them secret — treat them like passwords.
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(null) }}
          style={{ padding: "10px 18px", background: ACCENT, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
        >
          + Generate Key
        </button>
      </div>

      {/* ── New key form ─────────────────────────────────── */}
      {showForm && (
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: T1, marginBottom: 16 }}>New API Key</h2>
          <form onSubmit={handleCreate} style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: 13, color: T2, marginBottom: 6 }}>
                Key name <span style={{ color: T3 }}>(optional — helps you remember what it's for)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Production, My Zapier Integration"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", background: "#18181b", border: `1px solid ${BORDER}`, borderRadius: 8, color: T1, fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              style={{ padding: "10px 20px", background: creating ? "#3730a3" : ACCENT, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: creating ? "not-allowed" : "pointer", flexShrink: 0 }}
            >
              {creating ? "Generating…" : "Generate"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null) }}
              style={{ padding: "10px 16px", background: "transparent", color: T2, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 14, cursor: "pointer", flexShrink: 0 }}
            >
              Cancel
            </button>
          </form>
          {error && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "#450a0a", border: "1px solid #991b1b", borderRadius: 8, fontSize: 13, color: "#fca5a5" }}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* ── One-time key reveal ──────────────────────────── */}
      {newKeyValue && (
        <div style={{ background: "#0a2e1a", border: "1px solid #166534", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>🔑</span>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: GREEN }}>Your new API key — copy it now!</h2>
          </div>
          <p style={{ fontSize: 13, color: "#86efac", marginBottom: 16 }}>
            This is the <strong>only time</strong> you will see the full key. We don't store it.
            Copy it and save it somewhere safe (e.g. your .env file).
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <code style={{
              flex: 1, padding: "12px 16px", background: "#052e16",
              border: "1px solid #166534", borderRadius: 8,
              fontSize: 13, color: "#4ade80", fontFamily: "monospace",
              wordBreak: "break-all",
            }}>
              {newKeyValue}
            </code>
            <button
              onClick={() => handleCopy(newKeyValue)}
              style={{ padding: "10px 16px", background: copied ? "#166534" : "#14532d", color: "#4ade80", border: "1px solid #166534", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}
            >
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setNewKeyValue(null)}
            style={{ marginTop: 14, background: "none", border: "none", color: T3, fontSize: 13, cursor: "pointer", padding: 0 }}
          >
            I've saved my key — dismiss this
          </button>
        </div>
      )}

      {/* ── Keys list ────────────────────────────────────── */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 180px 120px 120px 80px", gap: 0, padding: "12px 20px", borderBottom: `1px solid ${BORDER}`, background: "#0f0f11" }}>
          {["Name", "Key", "Created", "Last used", ""].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: T3, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: T3, fontSize: 14 }}>Loading keys…</div>
        ) : keys.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔑</div>
            <p style={{ color: T2, fontSize: 14, marginBottom: 6 }}>No API keys yet</p>
            <p style={{ color: T3, fontSize: 13 }}>Click &quot;Generate Key&quot; to create your first key</p>
          </div>
        ) : (
          keys.map((k, i) => (
            <div
              key={k.id}
              style={{
                display: "grid", gridTemplateColumns: "1fr 180px 120px 120px 80px",
                gap: 0, padding: "16px 20px", alignItems: "center",
                borderBottom: i < keys.length - 1 ? `1px solid ${BORDER}` : "none",
              }}
            >
              {/* Name + status */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T1 }}>{k.name}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                    background: k.status === "active" ? "#0a2e1a" : "#1c0a0a",
                    color:      k.status === "active" ? GREEN : RED,
                    border:     `1px solid ${k.status === "active" ? "#166534" : "#991b1b"}`,
                  }}>
                    {k.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: T3, marginTop: 2 }}>
                  {k.request_count?.toLocaleString() || 0} requests total
                </div>
              </div>

              {/* Key prefix */}
              <code style={{ fontSize: 12, color: T2, fontFamily: "monospace" }}>
                {k.key_prefix}…
              </code>

              {/* Created */}
              <span style={{ fontSize: 12, color: T3 }}>{formatDate(k.created_at)}</span>

              {/* Last used */}
              <span style={{ fontSize: 12, color: T3 }}>
                {k.last_used_at ? formatDate(k.last_used_at) : "Never"}
              </span>

              {/* Actions */}
              <div>
                {k.status === "active" && (
                  <button
                    onClick={() => handleRevoke(k.id)}
                    style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info box */}
      <div style={{ marginTop: 20, padding: "14px 18px", background: "#111113", border: `1px solid ${BORDER}`, borderRadius: 10 }}>
        <p style={{ fontSize: 13, color: T3, lineHeight: 1.6 }}>
          <strong style={{ color: T2 }}>How to use your key:</strong> Add it to your requests as a header:{" "}
          <code style={{ background: "#18181b", padding: "2px 6px", borderRadius: 4, fontSize: 12, color: "#a5b4fc" }}>
            Authorization: Bearer ska_live_...
          </code>
        </p>
      </div>

    </div>
  )
}