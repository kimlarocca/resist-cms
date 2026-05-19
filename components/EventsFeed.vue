<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h3><i class="pi pi-calendar text-2xl text-red mr-1" /> Upcoming Events</h3>
      <NuxtLink v-if="calendarLink" :to="calendarLink" class="plain">
        Calendar View <i class="pi pi-arrow-right ml-1" />
      </NuxtLink>
    </div>
    <ProgressSpinner v-if="loading" class="my-8" />
    <div v-else-if="events.length === 0">
      <p class="text-gray-500">No upcoming events.</p>
    </div>
    <div v-else class="flex flex-col gap-4">
      <div
        v-for="event in visibleEvents"
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
            <Button icon="pi pi-calendar-plus" size="small" @click="exportToICS(event)" />
          </div>
          <div class="flex flex-col gap-1 text-sm text-gray-600 mb-3">
            <div v-if="event.websiteTitle" class="text-gray-500">
              {{ event.websiteTitle }}
            </div>
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
                    :href="mapsUrl(event.group_event_locations.address)"
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
          <div v-if="event.description || event.group_event_locations?.parking_info">
            <a
              class="plain flex items-center gap-1 text-xs font-semibold uppercase tracking-wide mb-2"
              @click="toggleDetails(event.id)"
            >
              <i
                :class="
                  expandedEvents.has(event.id) ? 'pi pi-chevron-up' : 'pi pi-chevron-down'
                "
              />
              More Details
            </a>
            <div v-if="expandedEvents.has(event.id)" class="flex flex-col gap-3">
              <div v-if="event.description" v-html="event.description" class="text-sm" />
              <div v-if="event.group_event_locations?.parking_info">
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1"
                >
                  Parking
                </p>
                <div v-html="event.group_event_locations.parking_info" class="text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="events.length > pageSize">
        <Button
          :label="showAll ? 'Show Less' : `Show ${events.length - pageSize} More`"
          :icon="showAll ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
          severity="secondary"
          text
          @click="showAll = !showAll"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pageSize: {
    type: Number,
    default: 5,
  },
  calendarLink: {
    type: String,
    default: null,
  },
})

const showAll = ref(false)
const expandedEvents = ref(new Set())
const toggleDetails = (id) => {
  const next = new Set(expandedEvents.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expandedEvents.value = next
}

const visibleEvents = computed(() =>
  showAll.value ? props.events : props.events.slice(0, props.pageSize)
)

const mapsUrl = (address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

const formatEventDate = (dateStr) => {
  if (!dateStr) return ""
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr + "T00:00:00"))
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
</script>
