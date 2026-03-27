// app/api/keys/route.js
// ─────────────────────────────────────────────────────────────
// POST /api/keys  → generate a new API key
// GET  /api/keys  → list all keys for the current user
// ─────────────────────────────────────────────────────────────

import { createClient } from "../../../lib/supabase/server"
import { adminClient }  from "../../../lib/supabase/admin"
import { NextResponse }  from "next/server"
import { createHash, randomBytes } from "crypto"

// ── Helper: generate a secure API key ────────────────────────
// Format: ska_live_<32 random hex chars>
// Example: ska_live_a3f9b2c1d4e5f6a7b8c9d0e1f2a3b4c5
function generateApiKey() {
  const raw    = randomBytes(32).toString("hex")        // 64 char random hex
  const key    = `ska_live_${raw}`                      // full key shown once
  const hash   = createHash("sha256").update(key).digest("hex")  // stored in DB
  const prefix = key.slice(0, 16)                       // "ska_live_a3f9b2" shown in UI
  return { key, hash, prefix }
}

// ── POST: Create a new API key ────────────────────────────────
export async function POST(request) {
  const supabase = await createClient()

  // 1. Get the logged-in user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Parse request body for optional key name
  const body = await request.json().catch(() => ({}))
  const name  = body.name?.trim() || "My API Key"

  // 3. Check how many active keys they already have (limit: 5 per user)
  const { count } = await adminClient
    .from("api_keys")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active")

  if (count >= 5) {
    return NextResponse.json(
      { error: "Maximum of 5 active API keys reached. Revoke one before creating another." },
      { status: 400 }
    )
  }

  // 4. Generate the key
  const { key, hash, prefix } = generateApiKey()

  // 5. Store it in the database (adminClient bypasses RLS)
  const { data: newKey, error: insertError } = await adminClient
    .from("api_keys")
    .insert({
      user_id:    user.id,
      name:       name,
      key_hash:   hash,
      key_prefix: prefix,
      status:     "active",
    })
    .select()
    .single()

  if (insertError) {
    console.error("Key insert error:", insertError)
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 })
  }

  // 6. Return the FULL key once — we never store the raw key
  //    After this response, the full key is gone forever
  return NextResponse.json({
    id:         newKey.id,
    name:       newKey.name,
    key:        key,        // ← full key, shown to user ONCE
    prefix:     prefix,
    created_at: newKey.created_at,
  }, { status: 201 })
}

// ── GET: List all API keys for the current user ───────────────
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: keys, error } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, status, created_at, last_used_at, request_count")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Failed to fetch keys" }, { status: 500 })
  }

  return NextResponse.json({ keys })
}