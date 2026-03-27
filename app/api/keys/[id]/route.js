// app/api/keys/[id]/route.js
// ─────────────────────────────────────────────────────────────
// DELETE /api/keys/:id  → revoke (soft-delete) an API key
// PATCH  /api/keys/:id  → rename a key
// ─────────────────────────────────────────────────────────────

import { createClient } from "../../../../lib/supabase/server"
import { adminClient }  from "../../../../lib/supabase/admin"
import { NextResponse }  from "next/server"

// ── DELETE: Revoke a key ──────────────────────────────────────
export async function DELETE(request, { params }) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = params

  // Make sure this key belongs to the current user before revoking
  const { data: existing } = await adminClient
    .from("api_keys")
    .select("id, user_id")
    .eq("id", id)
    .single()

  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 })
  }

  // Soft delete — set status to "revoked" and record when
  const { error } = await adminClient
    .from("api_keys")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: "Failed to revoke key" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// ── PATCH: Rename a key ───────────────────────────────────────
export async function PATCH(request, { params }) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id }  = params
  const body    = await request.json().catch(() => ({}))
  const newName = body.name?.trim()

  if (!newName) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  // Make sure this key belongs to the current user
  const { data: existing } = await adminClient
    .from("api_keys")
    .select("id, user_id")
    .eq("id", id)
    .single()

  if (!existing || existing.user_id !== user.id) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 })
  }

  const { error } = await adminClient
    .from("api_keys")
    .update({ name: newName })
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: "Failed to rename key" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}