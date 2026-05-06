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

const formatEventDate = (dateStr) => {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T00:00:00")
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d)
}

const formatEventMonth = (dateStr) => {
  if (!dateStr) return ""
  return new Intl.DateTimeFormat("en-US", { month: "short" })
    .format(new Date(dateStr + "T00:00:00"))
    .toUpperCase()
}

const formatEventDay = (dateStr) => {
  if (!dateStr) return ""
  return new Date(dateStr + "T00:00:00").getDate()
}

const formatEventTime = (timeStr) => {
  if (!timeStr) return ""
  const [h, m] = timeStr.split(":").map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d)
}

const formatEventTimeRange = (event) => {
  const start = formatEventTime(event.start_time)
  const end = event.end_time ? formatEventTime(event.end_time) : null
  return end ? `${start} \u2013 ${end}` : start
}

// Convert "YYYY-MM-DD" + "HH:MM:SS" to ICS datetime string "YYYYMMDDTHHmmss"
const toICSDateTime = (dateStr, timeStr) => {
  const [y, mo, d] = dateStr.split("-")
  const [h, m] = (timeStr || "00:00").split(":")
  return `${y}${mo}${d}T${h.padStart(2, "0")}${m.padStart(2, "0")}00`
}

const stripHtml = (html) => {
  if (!html) return ""
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim()
}

const exportToICS = (event) => {
  const dtStart = toICSDateTime(event.date, event.start_time)
  const dtEnd = event.end_time
    ? toICSDateTime(event.date, event.end_time)
    : toICSDateTime(event.date, event.start_time)
  const location = event.group_event_locations
    ? [event.group_event_locations.name, event.group_event_locations.address]
        .filter(Boolean)
        .join(", ")
    : ""
  const description = stripHtml(event.description)
  const uid = `event-${event.id}-${Date.now()}@resistcms`

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Resist CMS//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDateTime(
      new Date().toISOString().slice(0, 10),
      new Date().toTimeString().slice(0, 5)
    )}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.name}`,
    location ? `LOCATION:${location}` : null,
    description ? `DESCRIPTION:${description.replace(/\n/g, "\\n")}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n")

  const blob = new Blob([lines], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${event.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics`
  a.click()
  URL.revokeObjectURL(url)
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

    <h3 class="mb-6">
      <i class="pi pi-calendar text-2xl text-red mr-1" /> Upcoming Events
    </h3>
    <ProgressSpinner v-if="loadingEvents" class="my-8" />
    <div v-else-if="events.length === 0" class="mb-12">
      <p class="text-gray-500">No upcoming events.</p>
    </div>
    <div v-else class="flex flex-col gap-6 mb-12">
      <div
        v-for="event in events"
        :key="event.id"
        class="rounded-xl bg-gray shadow-xl overflow-hidden flex"
      >
        <!-- Date badge -->
        <div
          class="flex flex-col items-center justify-center bg-red text-white px-5 py-4 min-w-20 text-center"
        >
          <span class="text-xs font-semibold tracking-widest uppercase">{{
            formatEventMonth(event.date)
          }}</span>
          <span class="text-4xl font-bold leading-none">{{
            formatEventDay(event.date)
          }}</span>
        </div>
        <!-- Event details -->
        <div class="p-6 flex-1">
          <h4 class="mb-2">{{ event.name }}</h4>
          <div class="flex flex-col gap-1 text-sm text-gray-600 mb-3">
            <div class="flex items-center gap-2">
              <i class="pi pi-clock" />
              <span>{{ formatEventTimeRange(event) }}</span>
            </div>
            <div v-if="event.group_event_locations" class="flex items-center gap-2">
              <i class="pi pi-map-marker" />
              <span
                >{{ event.group_event_locations.name
                }}<span v-if="event.group_event_locations.address"
                  >, {{ event.group_event_locations.address }}</span
                ></span
              >
            </div>
            <div v-if="event.is_recurring" class="flex items-center gap-2">
              <i class="pi pi-refresh" />
              <span class="capitalize"
                >{{ event.recurrence_pattern }} recurring<span
                  v-if="event.recurrence_end_date"
                >
                  until {{ formatEventDate(event.recurrence_end_date) }}</span
                ></span
              >
            </div>
          </div>
          <div v-if="event.description" v-html="event.description" class="text-sm mb-3" />
          <div v-if="event.group_event_locations?.parking_info">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
              Parking
            </p>
            <div v-html="event.group_event_locations.parking_info" class="text-sm" />
          </div>
          <div class="mt-4">
            <Button
              label="Add to Calendar"
              icon="pi pi-calendar-plus"
              size="small"
              severity="secondary"
              @click="exportToICS(event)"
            />
          </div>
        </div>
      </div>
    </div>

    <h3 class="mb-6">
      <i class="pi pi-comment text-2xl text-red mr-1" /> Recent Announcements
    </h3>
    <ProgressSpinner v-if="loadingAnnouncements" class="my-8" />
    <div v-else-if="announcements.length === 0" class="mb-12">
      <p class="text-gray-500">No announcements yet.</p>
    </div>
    <div v-else class="flex flex-col gap-6 mb-12">
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
