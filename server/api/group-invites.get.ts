import { createClient } from "@supabase/supabase-js"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const websiteId = query.websiteId

  if (!websiteId) {
    throw createError({ statusCode: 400, message: "Missing websiteId." })
  }

  const config = useRuntimeConfig()

  if (!config.supabaseServiceKey) {
    throw createError({ statusCode: 500, message: "Server misconfiguration: missing service key." })
  }

  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  const { data: invites, error } = await supabaseAdmin
    .from("websites_users")
    .select("id, user_id, created_at")
    .eq("website_id", websiteId)
    .eq("status", "invited")
    .order("created_at", { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  if (!invites || invites.length === 0) return []

  // Resolve emails from auth.users
  const results = []
  for (const invite of invites) {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(invite.user_id)
    results.push({
      id: invite.id,
      user_id: invite.user_id,
      invited_at: invite.created_at,
      email: authUser?.user?.email || null,
    })
  }

  return results
})
