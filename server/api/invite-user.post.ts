import { createClient } from "@supabase/supabase-js"

export default defineEventHandler(async (event) => {
  const { email, websiteId, submissionId } = await readBody(event)

  if (!email || !websiteId) {
    throw createError({ statusCode: 400, message: "Missing required fields." })
  }

  const config = useRuntimeConfig()

  if (!config.supabaseServiceKey) {
    throw createError({ statusCode: 500, message: "Server misconfiguration: missing service key." })
  }

  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { pending_website_id: String(websiteId) },
    redirectTo: `${config.public.supabaseAuthSignInRedirectTo}/accept-invite`,
  })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
