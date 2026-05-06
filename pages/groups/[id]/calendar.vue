<script setup>
definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const supabase = useSupabaseClient()
const websiteId = computed(() => route.params.id)

const { data: website } = await useAsyncData(`website-${websiteId.value}`, () =>
  getWebsiteData(websiteId.value)
)

// --- Events ---
const events = ref([])
const loading = ref(true)

const fetchEvents = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from("group_events")
    .select("*, group_event_locations(*)")
    .eq("website_id", websiteId.value)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
  if (error) console.error("Error fetching events:", error)
  else events.value = data || []
  loading.value = false
}

onMounted(fetchEvents)

// --- Calendar navigation ---
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0-indexed

const monthLabel = computed(() =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    new Date(currentYear.value, currentMonth.value, 1)
  )
)

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  selectedDay.value = null
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  selectedDay.value = null
}

const goToToday = () => {
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
  selectedDay.value = null
}

// --- Calendar grid ---
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days = []
  // Leading empty cells
  for (let i = 0; i < firstDay; i++) days.push(null)
  // Actual days
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  // Trailing empty cells to complete last row
  while (days.length % 7 !== 0) days.push(null)

  return days
})

const todayDateStr = computed(() => {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`
})

const dayStr = (day) => {
  if (!day) return null
  return `${currentYear.value}-${String(currentMonth.value + 1).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`
}

// Map date string -> events[]
const eventsByDate = computed(() => {
  const map = {}
  for (const e of events.value) {
    if (!map[e.date]) map[e.date] = []
    map[e.date].push(e)
  }
  return map
})

// --- Selected day detail ---
const selectedDay = ref(null)

const selectedDayEvents = computed(() => {
  if (!selectedDay.value) return []
  return eventsByDate.value[selectedDay.value] || []
})

const selectedDayLabel = computed(() => {
  if (!selectedDay.value) return ""
  const d = new Date(selectedDay.value + "T00:00:00")
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d)
})

const selectDay = (day) => {
  if (!day) return
  const ds = dayStr(day)
  selectedDay.value = selectedDay.value === ds ? null : ds
}

// --- Formatting helpers ---
const formatTime = (timeStr) => {
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

const formatTimeRange = (event) => {
  const start = formatTime(event.start_time)
  const end = event.end_time ? formatTime(event.end_time) : null
  return end ? `${start} – ${end}` : start
}

// --- ICS export ---
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
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDateTime(
      new Date().toISOString().slice(0, 10),
      new Date().toTimeString().slice(0, 5)
    )}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.name || ""}`,
    location ? `LOCATION:${location}` : null,
    description ? `DESCRIPTION:${description}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n")

  const blob = new Blob([lines], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${event.name || "event"}.ics`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Group Calendar</Title>
      </Head>
    </Html>

    <h1 class="mb-6">Group Calendar</h1>
    <Divider class="my-7" />
    <h2 v-if="website?.title" class="mb-8">{{ website?.title }}</h2>

    <div v-if="loading" class="flex justify-center py-16">
      <ProgressSpinner />
    </div>

    <div v-else>
      <!-- Month navigation -->
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <Button
            icon="pi pi-chevron-left"
            severity="secondary"
            size="small"
            @click="prevMonth"
          />
          <Button
            icon="pi pi-chevron-right"
            severity="secondary"
            size="small"
            @click="nextMonth"
          />
        </div>
        <h3 class="text-xl font-semibold">{{ monthLabel }}</h3>
        <Button label="Today" severity="secondary" size="small" @click="goToToday" />
      </div>

      <!-- Calendar grid -->
      <div class="rounded-xl overflow-hidden border border-surface mb-8">
        <!-- Day name headers -->
        <div class="grid grid-cols-7 bg-surface-100">
          <div
            v-for="name in DAY_NAMES"
            :key="name"
            class="text-center text-xs font-semibold uppercase tracking-wide py-2 text-surface-500"
          >
            {{ name }}
          </div>
        </div>

        <!-- Day cells -->
        <div class="grid grid-cols-7">
          <div
            v-for="(day, idx) in calendarDays"
            :key="idx"
            :class="[
              'min-h-20 p-1 border-t border-surface relative',
              idx % 7 !== 0 ? 'border-l' : '',
              day ? 'cursor-pointer hover:bg-surface-50' : 'bg-surface-50 opacity-40',
              day && dayStr(day) === todayDateStr ? 'bg-primary/5' : '',
              day && dayStr(day) === selectedDay ? 'ring-2 ring-inset ring-primary' : '',
            ]"
            @click="selectDay(day)"
          >
            <!-- Day number -->
            <div
              v-if="day"
              :class="[
                'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1',
                dayStr(day) === todayDateStr
                  ? 'bg-primary text-white'
                  : 'text-surface-700',
              ]"
            >
              {{ day }}
            </div>

            <!-- Event dots / pills -->
            <div v-if="day" class="flex flex-col gap-0.5">
              <div
                v-for="event in (eventsByDate[dayStr(day)] || []).slice(0, 3)"
                :key="event.id"
                class="text-xs rounded px-1 py-0.5 bg-red text-white truncate leading-tight"
              >
                {{ event.name }}
              </div>
              <div
                v-if="(eventsByDate[dayStr(day)] || []).length > 3"
                class="text-xs text-surface-500 pl-1"
              >
                +{{ (eventsByDate[dayStr(day)] || []).length - 3 }} more
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected day detail panel -->
      <transition name="fade">
        <div v-if="selectedDay && selectedDayEvents.length > 0" class="mb-8">
          <h4 class="mb-4">{{ selectedDayLabel }}</h4>
          <div class="flex flex-col gap-4">
            <div
              v-for="event in selectedDayEvents"
              :key="event.id"
              class="rounded-xl bg-gray shadow-xl overflow-hidden flex"
            >
              <!-- Red left stripe -->
              <div class="w-2 bg-red shrink-0" />
              <div class="p-6 flex-1">
                <h5 class="mb-2">{{ event.name }}</h5>
                <div class="flex flex-col gap-1 text-sm text-gray-600 mb-3">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-clock" />
                    <span>{{ formatTimeRange(event) }}</span>
                  </div>
                  <div v-if="event.group_event_locations" class="flex items-center gap-2">
                    <i class="pi pi-map-marker" />
                    <span>
                      {{ event.group_event_locations.name
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
                      >
                    </span>
                  </div>
                  <div v-if="event.is_recurring" class="flex items-center gap-2">
                    <i class="pi pi-refresh" />
                    <span class="capitalize">
                      {{ event.recurrence_pattern }} recurring<span
                        v-if="event.recurrence_end_date"
                      >
                        until
                        {{
                          new Date(
                            event.recurrence_end_date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        }}</span
                      >
                    </span>
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
                  <div
                    v-html="event.group_event_locations.parking_info"
                    class="text-sm"
                  />
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
        </div>
        <div v-else-if="selectedDay && selectedDayEvents.length === 0" class="mb-8">
          <p class="text-surface-500">No events on {{ selectedDayLabel }}.</p>
        </div>
      </transition>
    </div>

    <Divider class="my-7" />
    <NuxtLink :to="`/groups/${websiteId}/dashboard`">
      <i class="pi pi-arrow-left mr-2" />Back to Dashboard
    </NuxtLink>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
