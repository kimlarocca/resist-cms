import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

export default defineEventHandler(async (event) => {
  const { userId, websiteId } = await readBody(event)

  if (!userId || !websiteId) {
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

  // Check if user already has access (invited or member)
  const { data: existing } = await supabaseAdmin
    .from("websites_users")
    .select("id, status")
    .eq("website_id", websiteId)
    .eq("user_id", userId)
    .maybeSingle()

  if (existing) {
    if (existing.status === "invited") {
      // Allow resend — fall through to send the email again without reinserting
    } else {
      throw createError({ statusCode: 409, message: "User already has access to this group." })
    }
  }

  if (!existing) {
    // Insert with invited status
    const { error: insertError } = await supabaseAdmin
      .from("websites_users")
      .insert({ website_id: websiteId, user_id: userId, status: "invited" })

    if (insertError) {
      throw createError({ statusCode: 500, message: insertError.message })
    }
  }

  // Get the user's email
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId)
  const userEmail = authUser?.user?.email

  if (!userEmail) {
    // Invitation row inserted but email not sent — non-fatal
    return { success: true, emailSent: false }
  }

  // Get the website/group name
  const { data: website } = await supabaseAdmin
    .from("websites")
    .select("title, slug")
    .eq("id", websiteId)
    .maybeSingle()

  const groupTitle = website?.title || "a group"
  const baseUrl = config.public.supabaseAuthSignInRedirectTo

  const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null

  if (!resend) {
    console.warn("Resend API key not configured — skipping group invite email.")
    return { success: true, emailSent: false }
  }

  const html = `
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
  `

  const { error: emailError } = await resend.emails.send({
    from: "Resist CMS <noreply@resistcms.com>",
    to: userEmail,
    subject: `You've been invited to join ${groupTitle} on Resist CMS`,
    html,
  })

  if (emailError) {
    console.error("Error sending group invite email:", emailError)
    return { success: true, emailSent: false }
  }

  return { success: true, emailSent: true }
})
