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

  // Fetch website membership records with profile data
  const { data: websiteUsers, error: wuError } = await supabaseAdmin
    .from("websites_users")
    .select(`
      id,
      created_at,
      user_id,
      profiles:user_id (
        id,
        full_name,
        role
      )
    `)
    .eq("website_id", websiteId)

  if (wuError) {
    throw createError({ statusCode: 500, message: wuError.message })
  }

  if (!websiteUsers || websiteUsers.length === 0) {
    return []
  }

  // Fetch emails from auth.users for each member
  const userIds = websiteUsers.map((wu) => wu.user_id).filter(Boolean)
  const emailMap: Record<string, string> = {}

  for (const userId of userIds) {
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (authUser?.user?.email) {
      emailMap[userId] = authUser.user.email
    }
  }

  return websiteUsers.map((wu) => ({
    websites_users_id: wu.id,
    user_id: wu.user_id,
    joined_at: wu.created_at,
    full_name: (wu.profiles as any)?.full_name || null,
    role: (wu.profiles as any)?.role || "member",
    email: emailMap[wu.user_id] || null,
  }))
})
