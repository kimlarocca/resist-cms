<template>
  <div>
    <h3 class="mb-6">
      <i class="pi pi-comment text-2xl text-red mr-1" /> Recent Announcements
    </h3>
    <ProgressSpinner v-if="loading" class="my-8" />
    <div v-else-if="announcements.length === 0">
      <p class="text-gray-500">No announcements yet.</p>
    </div>
    <div v-else class="flex flex-col gap-6">
      <div
        v-for="announcement in visibleAnnouncements"
        :key="announcement.id"
        class="rounded-xl bg-gray shadow-xl p-8"
      >
        <h4 class="mb-3">{{ announcement.title }}</h4>
        <p class="text-sm text-gray-500 mb-3">{{ formatPostedInfo(announcement) }}</p>
        <div v-html="announcement.message" />
      </div>
      <div v-if="announcements.length > pageSize">
        <Button
          :label="showAll ? 'Show Less' : `Show ${announcements.length - pageSize} More`"
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
  announcements: {
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
})

const showAll = ref(false)

const visibleAnnouncements = computed(() =>
  showAll.value ? props.announcements : props.announcements.slice(0, props.pageSize)
)

const formatPostedInfo = (announcement) => {
  const date = announcement.created_at
    ? new Intl.DateTimeFormat("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      }).format(new Date(announcement.created_at))
    : null
  const name = announcement.profiles?.nickname || announcement.profiles?.full_name
  const group = announcement.websiteTitle
  const parts = []
  if (date) parts.push(`Posted on ${date}`)
  if (name) parts.push(`by ${name}`)
  if (group) parts.push(`in ${group}`)
  return parts.join(" ")
}
</script>
