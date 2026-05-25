export default defineEventHandler(async (event) => {
  const { url } = await readBody(event)

  if (!url) {
    throw createError({ statusCode: 400, message: "URL is required." })
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ResistCMS/1.0; +https://resistcms.com)",
      },
    })

    if (!response.ok) {
      throw createError({
        statusCode: 502,
        message: `Failed to fetch URL: ${response.status} ${response.statusText}`,
      })
    }

    const html = await response.text()

    const getMetaContent = (html: string, property: string): string | null => {
      // Match both property="..." and name="..." attributes
      const patterns = [
        new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
      ]
      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match?.[1]) return match[1]
      }
      return null
    }

    const title =
      getMetaContent(html, "og:title") ||
      getMetaContent(html, "twitter:title") ||
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ||
      null

    const description =
      getMetaContent(html, "og:description") ||
      getMetaContent(html, "twitter:description") ||
      getMetaContent(html, "description") ||
      null

    const image =
      getMetaContent(html, "og:image") ||
      getMetaContent(html, "twitter:image") ||
      null

    return { title, description, image }
  } catch (err: any) {
    if (err.statusCode) throw err
    throw createError({
      statusCode: 500,
      message: err.message || "Failed to fetch Open Graph data.",
    })
  }
})
