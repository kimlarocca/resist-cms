import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

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

  // Check if this email already has an auth account
  let existingUserId: string | null = null
  {
    let page = 1
    while (true) {
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 })
      if (listError || !users?.length) break
      const match = users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
      if (match) { existingUserId = match.id; break }
      if (users.length < 1000) break
      page++
    }
  }

  if (existingUserId) {
    // --- Existing user: add to group as invited and send group invite email ---

    const { data: existingRow } = await supabaseAdmin
      .from("websites_users")
      .select("id, status")
      .eq("website_id", websiteId)
      .eq("user_id", existingUserId)
      .maybeSingle()

    if (existingRow?.status === "member") {
      // Already a full member — nothing to do
      return { success: true }
    }

    if (!existingRow) {
      const { error: insertError } = await supabaseAdmin
        .from("websites_users")
        .insert({ website_id: websiteId, user_id: existingUserId, status: "invited" })

      if (insertError) {
        throw createError({ statusCode: 500, message: insertError.message })
      }
    }
    // If existingRow.status === 'invited', fall through and resend the email

    const { data: website } = await supabaseAdmin
      .from("websites")
      .select("title")
      .eq("id", websiteId)
      .maybeSingle()

    const groupTitle = website?.title || "a group"
    const baseUrl = config.public.supabaseAuthSignInRedirectTo

    if (config.resendApiKey) {
      const resend = new Resend(config.resendApiKey)
      await resend.emails.send({
        from: "Resist CMS <noreply@resistcms.com>",
        to: email,
        subject: `You've been invited to join ${groupTitle} on Resist CMS`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">You've been invited to join ${groupTitle}</h2>
            <p style="color: #555;">
              You've been invited to join <strong>${groupTitle}</strong> on Resist CMS.
            </p>
            <p style="color: #555;">
              <strong>Next step:</strong> Log in to your account and accept the invitation from your dashboard under "Pending Group Invitations".
            </p>
            <p style="margin: 32px 0;">
              <a href="${baseUrl}/dashboard" style="background-color: #0a84ff; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                Go to Dashboard
              </a>
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              If you weren't expecting this invitation, you can ignore this email.
            </p>
          </div>
        `,
      })
    } else {
      console.warn("Resend API key not configured — skipping group invite email.")
    }

    return { success: true }
  }

  // --- New user: send Supabase invite email ---
  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { pending_website_id: String(websiteId) },
    redirectTo: `${config.public.supabaseAuthSignInRedirectTo}/accept-invite`,
  })

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
