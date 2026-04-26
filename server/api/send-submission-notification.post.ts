import { Resend } from "resend"

export default defineEventHandler(async (event) => {
    const { toEmail, websiteTitle, submitterEmail, formData } = await readBody(event)

    if (!toEmail || !submitterEmail || !formData) {
        throw createError({ statusCode: 400, message: "Missing required fields." })
    }

    const config = useRuntimeConfig()
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

    const { error } = await resend.emails.send({
        from: "Resist CMS <noreply@resistcms.com>",
        to: toEmail,
        subject: `New signup form submission — ${websiteTitle}`,
        html,
    })

    if (error) {
        console.error("Error sending email:", error)
        throw createError({ statusCode: 500, message: "Failed to send notification email." })
    }

    return { sent: true }
})
