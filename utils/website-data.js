// Fetch website data
export async function getWebsiteData (websiteId = 1) {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
        .from("websites")
        .select("*")
        .eq("id", websiteId)
        .single()

    if (error) {
        console.error("Error fetching website data:", error)
        return null
    }
    return data
}

// Fetch visibility brigade content
export async function getVisibilityBrigadeContent (websiteId = 1) {
    const supabase = useSupabaseClient()
    const { data, error } = await supabase
        .from("visibility-brigade-content")
        .select("*")
        .eq("website_id", websiteId)
        .single()

    if (error) {
        console.error("Error fetching visibility brigade content:", error)
        return null
    }
    return data
}

// Fetch all data for the website
export async function getAllWebsiteData (websiteId = 1) {
    const [websiteData, contentData] = await Promise.all([
        getWebsiteData(websiteId),
        getVisibilityBrigadeContent(websiteId),
    ])

    return {
        website: websiteData,
        content: contentData,
    }
}

// Fetch navigation links with dynamic CTA
export async function getVisibilityBrigadeNavigationLinks (websiteId = 1) {
    const supabase = useSupabaseClient()
    const links = [{ label: "About Us", anchor: "#about-us"}, { label: "Get Involved", anchor: "#get-involved" }]

    try {
        // Only include Photo Gallery if instagram_widget_id exists
        const { data } = await supabase
            .from("visibility-brigade-content")
            .select("instagram_widget_id")
            .eq("website_id", websiteId)
            .single()
        if (data?.instagram_widget_id) {
            links.push({ label: "Photo Gallery", anchor: "#gallery" })
        }
    } catch (e) {
        console.error("Error fetching navigation links content:", e)
    }

    return links
}

// Fetch social links from website data
export async function getSocialLinks (websiteId = 1) {
    const websiteData = await getWebsiteData(websiteId)

    if (!websiteData) return []

    const socialMediaConfig = [
        { key: "tiktok", icon: "pi pi-tiktok", label: "TikTok" },
        { key: "facebook", icon: "pi pi-facebook", label: "Facebook" },
        { key: "instagram", icon: "pi pi-instagram", label: "Instagram" },
        { key: "youtube", icon: "pi pi-youtube", label: "YouTube" },
        { key: "threads", icon: "pi pi-at", label: "Threads" },
        { key: "bluesky", icon: "custom", iconSrc: "/bluesky.svg", label: "Bluesky" },
        { key: "linktree", icon: "pi pi-link", label: "Linktree" },
        { key: "twitter", icon: "pi pi-twitter", label: "X / Twitter" },
        { key: "substack", icon: "custom", iconSrc: "/substack.svg", label: "Substack" },
    ]

    const links = []

    socialMediaConfig.forEach((config) => {
        const url = websiteData[config.key]
        if (url) {
            const link = {
                icon: config.icon,
                url: url,
                label: config.label,
            }
            if (config.iconSrc) {
                link.iconSrc = config.iconSrc
            }
            links.push(link)
        }
    })

    return links
}
