export default defineEventHandler(async (event) => {
    const { token } = await readBody(event)

    if (!token) {
        throw createError({ statusCode: 400, message: "Missing captcha token." })
    }

    const result = await verifyTurnstileToken(token)

    if (!result.success) {
        throw createError({ statusCode: 400, message: "Captcha verification failed." })
    }

    return { verified: true }
})
