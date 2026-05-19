import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

export default defineEventHandler(async (event) => {
    const { websiteId, websiteTitle, submitterEmail, formData } = await readBody(event)

    if (!websiteId || !submitterEmail || !formData) {
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

    // Find group_admin and group_manager members with allow_notifications = true
    const { data: members, error: membersError } = await supabaseAdmin
        .from("websites_users")
        .select(`
            user_id,
            profiles:user_id (
                role,
                allow_notifications
            )
        `)
        .eq("website_id", websiteId)

    if (membersError) {
        console.error("Error fetching members for notification:", membersError)
        return { sent: false }
    }

    const eligibleMembers = (members || []).filter((m: any) =>
        ["group_admin", "group_manager"].includes(m.profiles?.role) &&
        m.profiles?.allow_notifications === true
    )

    if (eligibleMembers.length === 0) return { sent: false }

    // Resolve auth emails for eligible members
    const recipients: string[] = []
    for (const member of eligibleMembers) {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(member.user_id)
        if (authUser?.user?.email) {
            recipients.push(authUser.user.email)
        }
    }

    if (recipients.length === 0) return { sent: false }

    const resend = new Resend(config.resendApiKey)

    const rows = Object.entries(formData)
        .map(
            ([key, value]) =>
                `<tr>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee; font-weight: 600; width: 40%; vertical-align: top;">${key}</td>
          <td style="padding: 6px 12px; border-bottom: 1px solid #eee; width: 60%;">${Array.isArray(value)
                    ? (value as string[]).join(", ")
                    : value === true
                        ? "Yes"
                        : value === false
                            ? "No"
                            : value || "—"
                }</td>
        </tr>`
        )
        .join("")

    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Signup Form Submission</h2>
      <p style="color: #555;">A new submission has been received for <strong>${websiteTitle}</strong> from <strong>${submitterEmail}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
        ${rows}
      </table>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        You can manage this submission at <a href="https://resistcms.com">Resist CMS</a>.
      </p>
    </div>
  `

    for (const toEmail of recipients) {
        const { error } = await resend.emails.send({
            from: "Resist CMS <noreply@resistcms.com>",
            to: toEmail,
            subject: `New signup form submission — ${websiteTitle}`,
            html,
        })
        if (error) {
            console.error("Error sending notification to", toEmail, error)
        }
    }

    return { sent: true, count: recipients.length }
})
