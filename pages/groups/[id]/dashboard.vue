<script setup>
definePageMeta({
  middleware: "auth",
})

import { useCurrentUserProfile } from "~/composables/states"

const route = useRoute()
const supabase = useSupabaseClient()
const websiteId = computed(() => route.params.id)
const { data: website } = await useAsyncData(`website-${websiteId.value}`, () =>
  getWebsiteData(websiteId.value)
)

const announcements = ref([])
const loadingAnnouncements = ref(true)
const showAllAnnouncements = ref(false)

const visibleAnnouncements = computed(() =>
  showAllAnnouncements.value ? announcements.value : announcements.value.slice(0, 5)
)

const formatPostedInfo = (announcement) => {
  const date = announcement.created_at
    ? new Intl.DateTimeFormat("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      }).format(new Date(announcement.created_at))
    : null
  const name = announcement.profiles?.full_name
  if (date && name) return `Posted on ${date} by ${name}`
  if (date) return `Posted on ${date}`
  return ""
}

const fetchAnnouncements = async () => {
  loadingAnnouncements.value = true

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("website_id", websiteId.value)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching announcements:", error)
    loadingAnnouncements.value = false
    return
  }

  const rows = data || []
  const userIds = [...new Set(rows.map((r) => r.created_by).filter(Boolean))]
  let profileMap = {}
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds)
    if (profiles) {
      profileMap = Object.fromEntries(profiles.map((p) => [p.id, p.full_name]))
    }
  }

  announcements.value = rows.map((r) => ({
    ...r,
    profiles: { full_name: profileMap[r.created_by] || null },
  }))

  loadingAnnouncements.value = false
}

onMounted(() => {
  fetchAnnouncements()
  fetchLinks()
})

const links = ref([])
const loadingLinks = ref(true)

const fetchLinks = async () => {
  loadingLinks.value = true

  const { data, error } = await supabase
    .from("group_links")
    .select("*")
    .eq("website_id", websiteId.value)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching group links:", error)
  } else {
    links.value = data || []
  }

  loadingLinks.value = false
}
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | {{ website?.title }}</Title>
      </Head>
    </Html>
    <h1 class="mb-6">{{ website?.title }}</h1>
    <Divider class="my-7" />
    <h2 class="mb-8">Team Member Portal</h2>
    <div v-if="website?.team_message" v-html="website?.team_message" class="mb-8" />

    <h3 class="mb-6">
      <i class="pi pi-comment text-2xl text-red mr-1" /> Recent Announcements
    </h3>
    <ProgressSpinner v-if="loadingAnnouncements" class="my-8" />
    <div v-else-if="announcements.length === 0">
      <p class="text-sm text-gray-500">No announcements yet.</p>
    </div>
    <div v-else class="flex flex-col gap-6">
      <div
        v-for="announcement in visibleAnnouncements"
        :key="announcement.id"
        class="rounded-xl bg-gray shadow-xl p-8"
      >
        <h4 class="mb-3">{{ announcement.title }}</h4>
        <div class="mb-3" v-html="announcement.message" />
        <p class="text-sm text-gray-500">{{ formatPostedInfo(announcement) }}</p>
      </div>
      <div v-if="announcements.length > 5">
        <Button
          :label="
            showAllAnnouncements ? 'Show Less' : `Show ${announcements.length - 5} More`
          "
          :icon="showAllAnnouncements ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
          severity="secondary"
          text
          @click="showAllAnnouncements = !showAllAnnouncements"
        />
      </div>
    </div>

    <Divider class="my-8" />

    <h3 class="mb-6">
      <i class="pi pi-external-link text-xl text-red mr-1" /> Key Links
    </h3>

    <ProgressSpinner v-if="loadingLinks" class="my-8" />
    <div v-else-if="links.length === 0">
      <p class="text-sm text-gray-500">No links yet.</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <a
        v-for="link in links"
        :key="link.id"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-xl bg-gray shadow-xl p-8 block hover:shadow-2xl transition-shadow no-underline"
      >
        <h4 class="mb-3">{{ link.title }}</h4>
        <div v-if="link.description" v-html="link.description" class="text-black" />
      </a>
    </div>
  </div>
</template>
