const websiteId = 1

// Fetch website data
export async function getWebsiteData () {
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
export async function getVisibilityBrigadeContent () {
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
export async function getAllWebsiteData () {
    const [websiteData, contentData] = await Promise.all([
        getWebsiteData(),
        getVisibilityBrigadeContent(),
    ])

    return {
        website: websiteData,
        content: contentData,
    }
}

// Fetch navigation links with dynamic CTA
export async function getNavigationLinks () {
    const contentData = await getVisibilityBrigadeContent()

    const links = [{ label: "About Us", href: "/", hash: "#about-us", target: "" }]

    // Only include Photo Gallery if instagram_widget_id exists
    if (contentData?.instagram_widget_id) {
        links.push({ label: "Photo Gallery", href: "/", hash: "#gallery", target: "" })
    }

    links.push(
        { label: "Get Involved", href: "/", hash: "#get-involved", target: "" },
        {
            label: contentData?.cta_text || "Join Us Today",
            href: contentData?.cta_link || "",
            hash: "",
            target: "_blank",
        }
    )

    return links
}

// Fetch social links from website data
export async function getSocialLinks () {
    const websiteData = await getWebsiteData()

    if (!websiteData) return []

    const socialMediaConfig = [
        { key: "tiktok", icon: "pi pi-tiktok", label: "TikTok" },
        { key: "facebook", icon: "pi pi-facebook", label: "Facebook" },
        { key: "instagram", icon: "pi pi-instagram", label: "Instagram" },
        { key: "youtube", icon: "pi pi-youtube", label: "YouTube" },
        { key: "threads", icon: "pi pi-at", label: "Threads" },
        { key: "bluesky", icon: "custom", iconSrc: "/bluesky.svg", label: "Bluesky" },
        { key: "linktree", icon: "pi pi-link", label: "Linktree" },
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
