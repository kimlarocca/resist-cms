import { createClient } from "@supabase/supabase-js"

export default defineEventHandler(async (event) => {
  const { userId } = await readBody(event)

  if (!userId) {
    throw createError({ statusCode: 400, message: "Missing userId." })
  }

  const config = useRuntimeConfig()

  if (!config.supabaseServiceKey) {
    throw createError({ statusCode: 500, message: "Server misconfiguration: missing service key." })
  }

  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey
  )

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
