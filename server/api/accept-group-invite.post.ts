import { createClient } from "@supabase/supabase-js"
import { serverSupabaseUser } from "#supabase/server"

export default defineEventHandler(async (event) => {
  const { websiteId } = await readBody(event)
  if (!websiteId) {
    throw createError({ statusCode: 400, message: "Missing websiteId." })
  }

  const config = useRuntimeConfig()

  if (!config.supabaseServiceKey) {
    throw createError({ statusCode: 500, message: "Server misconfiguration: missing service key." })
  }

  let userId: string | null = null
  let email: string | null = null

  // Prefer cookie/session auth when available.
  const authUser = await serverSupabaseUser(event)
  if (authUser?.id) {
    userId = authUser.id
    email = authUser.email ?? null
  } else {
    // Fallback to bearer token auth for explicit header-based calls.
    const authHeader = getHeader(event, "authorization")
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, "")
      if (token) {
        try {
          const parts = token.split(".")
          if (parts.length !== 3) {
            throw new Error("Invalid token format")
          }
          const payload = JSON.parse(
            Buffer.from(parts[1], "base64").toString("utf-8")
          )
          userId = payload.sub || null
          email = payload.email || null
        } catch (err) {
          console.error("Token decode error:", err)
        }
      }
    }
  }

  if (!userId) {
    throw createError({ statusCode: 401, message: "Not authenticated." })
  }

  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  // Look for an active invited row for this user + group
  // Use select + limit instead of maybeSingle to avoid errors from duplicate rows
  const { data: invitedRows } = await supabaseAdmin
    .from("websites_users")
    .select("id, status")
    .eq("user_id", userId)
    .eq("website_id", websiteId)
    .eq("status", "invited")
    .limit(1)

  const invitedRow = invitedRows?.[0] ?? null

  if (!invitedRow) {
    // Check if they're already a member (idempotent accept)
    const { data: memberRows } = await supabaseAdmin
      .from("websites_users")
      .select("id")
      .eq("user_id", userId)
      .eq("website_id", websiteId)
      .eq("status", "member")
      .limit(1)

    if (memberRows?.[0]) {
      return { success: true, alreadyMember: true }
    }

    throw createError({ statusCode: 404, message: "No pending invitation found. It may have been revoked." })
  }

  const invite = invitedRow

  const { error } = await supabaseAdmin
    .from("websites_users")
    .update({ status: "member" })
    .eq("id", invite.id)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  // Also mark any matching signup form submission as active (best-effort)
  if (email) {
    await supabaseAdmin
      .from("visibility-brigade-submissions")
      .update({ status: "active" })
      .eq("website_id", websiteId)
      .eq("email", email)
      .eq("status", "invited")
  }

  return { success: true }
})
