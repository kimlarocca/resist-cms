<script setup>
definePageMeta({
  middleware: "auth",
})

import { useCurrentUserProfile } from "~/composables/states"

const route = useRoute()
const supabase = useSupabaseClient()
const currentUserProfile = useCurrentUserProfile()
const websiteId = computed(() => route.params.id)
const { data: website } = await useAsyncData(`website-${websiteId.value}`, () =>
  getWebsiteData(websiteId.value)
)

const announcements = ref([])
const loadingAnnouncements = ref(true)

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
      .select("id, full_name, nickname")
      .in("id", userIds)
    if (profiles) {
      profileMap = Object.fromEntries(
        profiles.map((p) => [p.id, { full_name: p.full_name, nickname: p.nickname }])
      )
    }
  }

  announcements.value = rows.map((r) => ({
    ...r,
    profiles: profileMap[r.created_by] || null,
  }))

  loadingAnnouncements.value = false
}

onMounted(() => {
  fetchAnnouncements()
  fetchLinks()
  fetchEvents()
})

const events = ref([])
const loadingEvents = ref(true)

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
}

const fetchEvents = async () => {
  loadingEvents.value = true

  const { data, error } = await supabase
    .from("group_events")
    .select("*, group_event_locations(*)")
    .eq("website_id", websiteId.value)
    .gte("date", todayStr())
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Error fetching events:", error)
  } else {
    events.value = data || []
  }

  loadingEvents.value = false
}

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

    <div
      v-if="
        ['super_admin', 'group_admin', 'group_manager', 'event_manager'].includes(
          currentUserProfile?.role
        )
      "
      class="relative rounded-xl bg-gray shadow-xl p-8 mb-12"
    >
      <Tag
        value="Admin Links"
        class="absolute top-0 left-8 transform -translate-y-1/2 w-fit"
      />
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
        <template
          v-if="
            currentUserProfile?.role !== 'event_manager' &&
            currentUserProfile?.role !== 'member'
          "
        >
          <NuxtLink :to="`/groups/${websiteId}`" class="plain flex items-center"
            ><i class="pi pi-cog mr-1" />Settings</NuxtLink
          >
          <NuxtLink
            :to="`/groups/${websiteId}/manage-content`"
            class="plain flex items-center"
            ><i class="pi pi-pencil mr-1" />Content</NuxtLink
          >
          <NuxtLink
            :to="`/groups/${websiteId}/manage-signup-form`"
            class="plain flex items-center"
            ><i class="pi pi-clipboard mr-1" />Signup Form</NuxtLink
          >
          <NuxtLink
            :to="`/groups/${websiteId}/manage-members`"
            class="plain flex items-center"
            ><i class="pi pi-users mr-1" />Members</NuxtLink
          >
          <NuxtLink
            :to="`/groups/${websiteId}/manage-announcements`"
            class="plain flex items-center"
            ><i class="pi pi-megaphone mr-1" />Announcements</NuxtLink
          >
          <NuxtLink
            :to="`/groups/${websiteId}/manage-links`"
            class="plain flex items-center"
            ><i class="pi pi-link mr-1" />Links</NuxtLink
          >
        </template>
        <NuxtLink
          :to="`/groups/${websiteId}/manage-events`"
          class="plain flex items-center"
          ><i class="pi pi-calendar mr-1" />Events</NuxtLink
        >
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
      <!-- Upcoming Events -->
      <div>
        <EventsFeed
          :events="events"
          :loading="loadingEvents"
          :calendar-link="`/groups/${websiteId}/calendar`"
        />
      </div>

      <!-- Recent Announcements -->
      <div>
        <h3 class="mb-6">
          <i class="pi pi-comment text-2xl text-red mr-1" /> Recent Announcements
        </h3>
        <ProgressSpinner v-if="loadingAnnouncements" class="my-8" />
        <div v-else-if="announcements.length === 0">
          <p class="text-gray-500">No announcements yet.</p>
        </div>
        <div v-else class="flex flex-col gap-6">
          <div
            v-for="announcement in visibleAnnouncements"
            :key="announcement.id"
            class="rounded-xl bg-gray shadow-xl p-8"
          >
            <h4 class="mb-2">{{ announcement.title }}</h4>
            <p class="text-sm text-gray-500 mb-3">{{ formatPostedInfo(announcement) }}</p>
            <div v-html="announcement.message" />
          </div>
          <div v-if="announcements.length > 5">
            <Button
              :label="
                showAllAnnouncements
                  ? 'Show Less'
                  : `Show ${announcements.length - 5} More`
              "
              :icon="showAllAnnouncements ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
              severity="secondary"
              text
              @click="showAllAnnouncements = !showAllAnnouncements"
            />
          </div>
        </div>
      </div>
    </div>

    <h3 class="mb-6">
      <i class="pi pi-external-link text-xl text-red mr-1" /> Key Links
    </h3>

    <ProgressSpinner v-if="loadingLinks" class="my-8" />
    <div v-else-if="links.length === 0" class="mb-12">
      <p class="text-gray-500">No links yet.</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      <a
        v-for="link in links"
        :key="link.id"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="plain rounded-xl bg-gray shadow-xl p-8 block hover:shadow-2xl transition-shadow no-underline"
      >
        <h4 class="mb-3">{{ link.title }}</h4>
        <div v-if="link.description" v-html="link.description" class="text-black" />
      </a>
    </div>
  </div>
</template>
