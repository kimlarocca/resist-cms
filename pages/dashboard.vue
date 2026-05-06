<script setup>
import { useCurrentUserProfile } from "~/composables/states"
definePageMeta({
  middleware: "auth",
})
const currentUserProfile = useCurrentUserProfile()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

// Complete profile dialog (shown to newly invited users)
const setupDialogVisible = ref(false)
const setupFullName = ref("")
const setupPhone = ref("")
const setupPassword = ref("")
const setupConfirmPassword = ref("")
const setupLoading = ref(false)
const setupError = ref("")

const checkIfNeedsSetup = () => {
  if (currentUserProfile.value && !currentUserProfile.value.onboarded) {
    setupDialogVisible.value = true
  }
}

const submitSetup = async () => {
  setupError.value = ""
  if (setupPassword.value.length < 8) {
    setupError.value = "Password must be at least 8 characters."
    return
  }
  if (setupPassword.value !== setupConfirmPassword.value) {
    setupError.value = "Passwords do not match."
    return
  }
  setupLoading.value = true
  const { error } = await supabase.auth.updateUser({
    password: setupPassword.value,
    data: { full_name: setupFullName.value, profile_complete: true },
  })
  if (error) {
    setupError.value = error.message
    setupLoading.value = false
    return
  }
  // Also update the profiles table
  if (currentUserProfile.value?.id) {
    await supabase
      .from("profiles")
      .update({
        full_name: setupFullName.value,
        phone: setupPhone.value || null,
        onboarded: true,
      })
      .eq("id", currentUserProfile.value.id)
  }
  setupLoading.value = false
  setupDialogVisible.value = false
  // Update in-memory profile so the redirect check sees onboarded: true
  if (currentUserProfile.value) {
    currentUserProfile.value.onboarded = true
    currentUserProfile.value.full_name = setupFullName.value
  }
  // Now that onboarding is complete, run the redirect check
  fetchUserWebsites()
}

// User's websites/groups
const userWebsites = ref([])
const loadingWebsites = ref(true)

// Fetch websites user has permission to manage
const fetchUserWebsites = async () => {
  if (!currentUserProfile.value?.id) {
    loadingWebsites.value = false
    return
  }

  loadingWebsites.value = true

  try {
    const { data, error } = await supabase
      .from("websites_users")
      .select(
        `
        website_id,
        websites:website_id (
          id,
          title,
          url,
          slug,
          email,
          type,
          published
        )
      `
      )
      .eq("user_id", currentUserProfile.value.id)

    if (error) throw error

    userWebsites.value = data?.map((item) => item.websites).filter(Boolean) || []

    // Auto-redirect members who belong to exactly one group (only if onboarding is complete)
    if (
      currentUserProfile.value?.role === "member" &&
      userWebsites.value.length === 1 &&
      currentUserProfile.value?.onboarded
    ) {
      return navigateTo(`/groups/${userWebsites.value[0].id}/dashboard`)
    }

    // Fetch cross-group announcements if member of 2+ groups
    await fetchAllAnnouncements()
    await fetchAllEvents()
  } catch (error) {
    console.error("Error fetching user websites:", error)
  } finally {
    loadingWebsites.value = false
  }
}

// Navigate to edit group settings
const editGroupSettings = (websiteId) => {
  router.push(`/groups/${websiteId}`)
}

// Navigate to manage content
const manageContent = (websiteId) => {
  router.push(`/groups/${websiteId}/manage-content`)
}

// Navigate to manage signup form
const manageSignupForm = (websiteId) => {
  router.push(`/groups/${websiteId}/manage-signup-form`)
}

// Navigate to manage form submissions
const manageFormSubmissions = (websiteId) => {
  router.push(`/groups/${websiteId}/manage-form-submissions`)
}

// Cross-group announcements feed (shown when member of 2+ groups)
const allAnnouncements = ref([])
const loadingAllAnnouncements = ref(false)
const announcementsLimit = ref(10)

const visibleAllAnnouncements = computed(() =>
  allAnnouncements.value.slice(0, announcementsLimit.value)
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
  const group = announcement.websiteTitle
  const parts = []
  if (date) parts.push(`Posted on ${date}`)
  if (name) parts.push(`by ${name}`)
  if (group) parts.push(`in ${group}`)
  return parts.join(" ")
}

const fetchAllAnnouncements = async () => {
  if (userWebsites.value.length < 2) return
  loadingAllAnnouncements.value = true

  const websiteIds = userWebsites.value.map((w) => w.id)
  const supabase = useSupabaseClient()

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .in("website_id", websiteIds)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching announcements:", error)
    loadingAllAnnouncements.value = false
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

  const websiteMap = Object.fromEntries(userWebsites.value.map((w) => [w.id, w.title]))

  allAnnouncements.value = rows.map((r) => ({
    ...r,
    profiles: { full_name: profileMap[r.created_by] || null },
    websiteTitle: websiteMap[r.website_id] || null,
  }))

  loadingAllAnnouncements.value = false
}

// Cross-group events feed (shown when member of 2+ groups)
const allEvents = ref([])
const loadingAllEvents = ref(false)
const eventsLimit = ref(10)

const visibleAllEvents = computed(() => allEvents.value.slice(0, eventsLimit.value))

const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`
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

const formatEventDate = (dateStr) => {
  if (!dateStr) return ""
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr + "T00:00:00"))
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

const fetchAllEvents = async () => {
  if (userWebsites.value.length < 2) return
  loadingAllEvents.value = true
  const websiteIds = userWebsites.value.map((w) => w.id)
  const supabase = useSupabaseClient()
  const { data, error } = await supabase
    .from("group_events")
    .select("*, group_event_locations(*)")
    .in("website_id", websiteIds)
    .gte("date", todayStr())
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
  if (error) console.error("Error fetching events:", error)
  else {
    const websiteMap = Object.fromEntries(userWebsites.value.map((w) => [w.id, w.title]))
    allEvents.value = (data || []).map((e) => ({
      ...e,
      websiteTitle: websiteMap[e.website_id] || null,
    }))
  }
  loadingAllEvents.value = false
}

// Watch for currentUserProfile to become available
watch(
  () => currentUserProfile.value?.id,
  (newId) => {
    if (newId) {
      fetchUserWebsites()
      checkIfNeedsSetup()
    }
  },
  { immediate: true }
)

// Fetch user websites on mount
onMounted(() => {
  fetchUserWebsites()
})
</script>
<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Dashboard</Title>
      </Head>
    </Html>
    <h1 class="mb-6">Dashboard</h1>
    <p v-if="currentUserProfile?.full_name" class="mb-12">
      Welcome back, {{ currentUserProfile?.full_name }}!
    </p>

    <!-- Complete profile dialog for newly invited users -->
    <Dialog
      v-model:visible="setupDialogVisible"
      modal
      header="Please Set Up Your Account"
      :closable="false"
      :style="{ width: '32rem' }"
    >
      <p class="mb-4 text-gray-500">
        Welcome to Resist CMS! Please set your name and create a password to complete your
        account setup.
      </p>
      <form @submit.prevent="submitSetup" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="setup-name">Full Name</label>
          <InputText
            id="setup-name"
            v-model="setupFullName"
            placeholder="Your full name"
            autocomplete="name"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="setup-phone"
            >Phone Number <span class="text-gray-400 font-normal">(optional)</span></label
          >
          <InputText
            id="setup-phone"
            v-model="setupPhone"
            placeholder="Your phone number"
            autocomplete="tel"
            type="tel"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="setup-password">Password</label>
          <Password
            id="setup-password"
            v-model="setupPassword"
            placeholder="Choose a password (min 8 characters)"
            :feedback="true"
            toggleMask
            class="w-full"
            inputClass="w-full"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="setup-confirm">Confirm Password</label>
          <Password
            id="setup-confirm"
            v-model="setupConfirmPassword"
            placeholder="Confirm your password"
            :feedback="false"
            toggleMask
            class="w-full"
            inputClass="w-full"
          />
        </div>
        <Message v-if="setupError" severity="error">{{ setupError }}</Message>
      </form>
      <template #footer>
        <Button
          label="Save & Continue"
          icon="pi pi-check"
          :loading="setupLoading"
          @click="submitSetup"
        />
      </template>
    </Dialog>

    <!-- super admins only -->
    <div
      v-if="currentUserProfile?.role === 'super_admin'"
      class="relative rounded-xl bg-gray shadow-xl p-8 mb-16"
    >
      <Tag
        value="Super Admin Quick Links"
        class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
      />
      <div class="flex items-center gap-4">
        <NuxtLink to="/groups" class="plain block">
          <Button label="Manage Groups" class="white" />
        </NuxtLink>
        <NuxtLink to="/key-links" class="plain block">
          <Button label="Manage Key Links" class="white" />
        </NuxtLink>
        <NuxtLink to="/surveys/categories" class="plain block">
          <Button label="Manage Survey Categories" class="white" />
        </NuxtLink>
      </div>
    </div>

    <!-- election managers and super admins -->
    <div
      v-if="
        currentUserProfile?.role === 'super_admin' ||
        currentUserProfile?.role === 'election_manager'
      "
      class="relative rounded-xl bg-gray shadow-xl p-8 mb-16"
    >
      <Tag
        value="Election Manager Quick Links"
        class="absolute top-0 left-8 transform -translate-y-1/2 w-fit mx-auto"
      />
      <div class="flex items-center gap-4">
        <NuxtLink to="/elections" class="plain block">
          <Button label="My Elections" class="white" />
        </NuxtLink>
        <NuxtLink to="/candidates/" class="plain block">
          <Button label="My Candidates" class="white" />
        </NuxtLink>
        <NuxtLink to="/surveys" class="plain block">
          <Button label="My Surveys" class="white" />
        </NuxtLink>
      </div>
    </div>

    <!-- My Groups/Websites -->
    <div v-if="userWebsites.length > 0 || loadingWebsites">
      <div v-if="loadingWebsites" class="flex justify-center py-8">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
      </div>

      <div v-else>
        <h2 class="mb-8">My Groups</h2>
        <div>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div
              v-for="website in userWebsites"
              :key="website.id"
              class="flex flex-col rounded-xl bg-gray shadow-xl p-8"
            >
              <h3 class="mb-3">{{ website.title || "Untitled" }}</h3>
              <p v-if="website.url" class="mb-1">
                <a :href="website.url" target="_blank" class="plain text-sm">
                  View Public Site <i class="pi pi-arrow-right text-xs ml-1" />
                </a>
              </p>
              <p v-else-if="website.slug" class="mb-1">
                <a
                  :href="`https://resistcms.com/${website.slug}`"
                  target="_blank"
                  class="plain text-sm"
                >
                  View Public Site <i class="pi pi-arrow-right text-xs ml-1" />
                </a>
              </p>
              <p>
                <NuxtLink :to="`/groups/${website.id}/dashboard`" class="plain text-sm">
                  View Team Only Site <i class="pi pi-arrow-right text-xs ml-1" />
                </NuxtLink>
              </p>

              <template
                v-if="
                  [
                    'super_admin',
                    'group_admin',
                    'group_manager',
                    'event_manager',
                  ].includes(currentUserProfile?.role)
                "
              >
                <Divider class="darker" />
                <h4>Admin Links</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-1 mt-4 text-sm">
                  <template v-if="currentUserProfile?.role !== 'event_manager'">
                    <NuxtLink :to="`/groups/${website.id}`" class="plain block">
                      Settings
                    </NuxtLink>
                    <NuxtLink
                      :to="`/groups/${website.id}/manage-content`"
                      class="plain block"
                    >
                      Content
                    </NuxtLink>
                    <NuxtLink
                      :to="`/groups/${website.id}/manage-signup-form`"
                      class="plain block"
                    >
                      Signup Form
                    </NuxtLink>
                    <NuxtLink
                      :to="`/groups/${website.id}/manage-members`"
                      class="plain block"
                    >
                      Members
                    </NuxtLink>
                    <NuxtLink
                      :to="`/groups/${website.id}/manage-announcements`"
                      class="plain block"
                    >
                      Announcements
                    </NuxtLink>
                    <NuxtLink
                      :to="`/groups/${website.id}/manage-links`"
                      class="plain block"
                    >
                      Links
                    </NuxtLink>
                  </template>
                  <NuxtLink
                    :to="`/groups/${website.id}/manage-events`"
                    class="plain block"
                  >
                    Events
                  </NuxtLink>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cross-group events + announcements grid (2+ groups) -->
    <div
      v-if="userWebsites.length > 1"
      class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-start"
    >
      <!-- Events column -->
      <div>
        <h3><i class="pi pi-calendar text-2xl text-red mr-1 mb-6" /> Upcoming Events</h3>
        <div v-if="loadingAllEvents" class="flex justify-center py-8">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
        </div>
        <div v-else-if="allEvents.length === 0">
          <p class="text-gray-500">No upcoming events.</p>
        </div>
        <div v-else class="flex flex-col gap-4">
          <div
            v-for="event in visibleAllEvents"
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
              <div class="flex items-center justify-between mb-1">
                <h4>{{ event.name }}</h4>
                <span v-if="event.websiteTitle" class="text-xs text-gray-500">{{
                  event.websiteTitle
                }}</span>
              </div>
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
                      >,
                      <a
                        :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          event.group_event_locations.address
                        )}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        >{{ event.group_event_locations.address }}</a
                      ></span
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
              <div
                v-if="event.description"
                v-html="event.description"
                class="text-sm mb-3"
              />
              <div v-if="event.group_event_locations?.parking_info">
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1"
                >
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
          <div v-if="allEvents.length > eventsLimit">
            <Button
              :label="`Load ${Math.min(10, allEvents.length - eventsLimit)} More`"
              icon="pi pi-chevron-down"
              severity="secondary"
              text
              @click="eventsLimit += 10"
            />
          </div>
        </div>
      </div>

      <!-- Announcements column -->
      <div>
        <h3 class="mb-6">
          <i class="pi pi-comment text-2xl text-red mr-1" /> Recent Announcements
        </h3>
        <div v-if="loadingAllAnnouncements" class="flex justify-center py-8">
          <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
        </div>
        <div v-else-if="allAnnouncements.length === 0">
          <p class="text-gray-500">No announcements yet.</p>
        </div>
        <div v-else class="flex flex-col gap-6">
          <div
            v-for="announcement in visibleAllAnnouncements"
            :key="announcement.id"
            class="rounded-xl bg-gray shadow-xl p-8"
          >
            <h4 class="mb-3">{{ announcement.title }}</h4>
            <div class="mb-3" v-html="announcement.message" />
            <p class="text-sm text-gray-500">{{ formatPostedInfo(announcement) }}</p>
          </div>
          <div v-if="allAnnouncements.length > announcementsLimit">
            <Button
              :label="`Load ${Math.min(
                10,
                allAnnouncements.length - announcementsLimit
              )} More`"
              icon="pi pi-chevron-down"
              severity="secondary"
              text
              @click="announcementsLimit += 10"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
