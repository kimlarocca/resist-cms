import { createClient } from "@supabase/supabase-js"

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.supabaseServiceKey) {
    throw createError({ statusCode: 500, message: "Server misconfiguration: missing service key." })
  }

  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  // Fetch all profiles
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, nickname, role")
    .order("full_name", { ascending: true })

  if (profilesError) {
    throw createError({ statusCode: 500, message: profilesError.message })
  }

  if (!profiles || profiles.length === 0) return []

  // Fetch all auth users at once for emails and signup dates
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (authError) {
    throw createError({ statusCode: 500, message: authError.message })
  }

  const emailMap: Record<string, string> = {}
  const createdAtMap: Record<string, string> = {}
  for (const u of authData?.users || []) {
    if (u.id) {
      emailMap[u.id] = u.email || ""
      createdAtMap[u.id] = u.created_at || ""
    }
  }

  return profiles.map((p) => ({
    user_id: p.id,
    full_name: p.full_name || null,
    nickname: p.nickname || null,
    role: p.role || "member",
    email: emailMap[p.id] || null,
    created_at: createdAtMap[p.id] || null,
  }))
})
