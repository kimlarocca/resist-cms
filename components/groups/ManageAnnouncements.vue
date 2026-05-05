<template>
  <div>
    <div class="flex items-center justify-between gap-6 mb-6">
      <p>
        Announcements are visible to all team members on the Team Only Site and on the
        Dashboard. Use announcements to share important updates, reminders, and
        information with your team.
      </p>
      <Button
        label="New Announcement"
        icon="pi pi-plus"
        style="width: 400px"
        @click="openCreateDialog"
      />
    </div>

    <Message v-if="errorMessage" severity="error" class="mb-4" @close="errorMessage = ''">
      {{ errorMessage }}
    </Message>

    <Message v-if="successMessage" severity="success" class="mb-4" :closable="false">
      {{ successMessage }}
    </Message>

    <ProgressSpinner v-if="loading" class="my-8" />

    <div v-else-if="announcements.length === 0">
      <p class="text-sm text-gray-500">
        No announcements yet. Create one to get started.
      </p>
    </div>

    <DataTable v-else :value="announcements" tableStyle="min-width: 30rem">
      <Column field="title" header="Title" style="min-width: 14rem">
        <template #body="{ data }">
          <strong>{{ data.title }}</strong>
        </template>
      </Column>
      <Column header="Created By" style="width: 14rem">
        <template #body="{ data }">
          {{ data.profiles?.full_name || "—" }}
        </template>
      </Column>
      <Column header="Date" style="width: 12rem">
        <template #body="{ data }">
          {{ formatDate(data.created_at) }}
        </template>
      </Column>
      <Column style="width: 8rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              size="small"
              text
              v-tooltip.top="'Edit'"
              @click="openEditDialog(data)"
            />
            <Button
              icon="pi pi-trash"
              size="small"
              text
              severity="danger"
              v-tooltip.top="'Delete'"
              @click="confirmDelete(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Create / Edit Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editingAnnouncement ? 'Edit Announcement' : 'New Announcement'"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="flex flex-col gap-6 pt-6">
        <p v-if="editingAnnouncement?.profiles?.full_name" class="text-sm text-gray-500">
          Created by <strong>{{ editingAnnouncement.profiles.full_name }}</strong> on
          {{ formatDate(editingAnnouncement.created_at) }}
        </p>
        <FloatLabel variant="on">
          <InputText id="ann-title" v-model="form.title" class="w-full" />
          <label for="ann-title">Title</label>
        </FloatLabel>

        <div>
          <label class="block text-sm font-medium mb-2">Message</label>
          <SimpleEditor id="ann-message" v-model="form.message" height="160px" />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" severity="secondary" @click="closeDialog" />
        <Button
          :label="editingAnnouncement ? 'Save Changes' : 'Create'"
          icon="pi pi-check"
          @click="saveAnnouncement"
          :loading="saving"
          :disabled="!form.title.trim()"
        />
      </template>
    </Dialog>

    <!-- Delete Confirm Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="Delete Announcement"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span>
          Are you sure you want to delete
          <strong>{{ announcementToDelete?.title }}</strong
          >? This cannot be undone.
        </span>
      </div>
      <template #footer>
        <Button
          label="Cancel"
          severity="secondary"
          @click="deleteDialogVisible = false"
        />
        <Button
          label="Delete"
          severity="danger"
          @click="deleteAnnouncement"
          :loading="deleting"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { useCurrentUserProfile } from "~/composables/states"

const props = defineProps({
  websiteId: {
    type: [String, Number],
    required: true,
  },
})

const supabase = useSupabaseClient()
const currentUserProfile = useCurrentUserProfile()

const announcements = ref([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref("")
const successMessage = ref("")
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingAnnouncement = ref(null)
const announcementToDelete = ref(null)

const emptyForm = () => ({ title: "", message: "" })
const form = ref(emptyForm())

const formatDate = (dateStr) => {
  if (!dateStr) return ""
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
}

const fetchAnnouncements = async () => {
  loading.value = true
  errorMessage.value = ""

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("website_id", props.websiteId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching announcements:", error)
    errorMessage.value = "Failed to load announcements."
    loading.value = false
    return
  }

  const rows = data || []

  // Look up profile names for any created_by user IDs
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

  loading.value = false
}

const openCreateDialog = () => {
  editingAnnouncement.value = null
  form.value = emptyForm()
  dialogVisible.value = true
}

const openEditDialog = (announcement) => {
  editingAnnouncement.value = announcement
  form.value = { title: announcement.title, message: announcement.message || "" }
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
}

const saveAnnouncement = async () => {
  if (!form.value.title.trim()) return

  saving.value = true
  errorMessage.value = ""

  try {
    if (editingAnnouncement.value) {
      const { error } = await supabase
        .from("announcements")
        .update({ title: form.value.title, message: form.value.message })
        .eq("id", editingAnnouncement.value.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from("announcements").insert({
        website_id: props.websiteId,
        title: form.value.title,
        message: form.value.message,
        created_by: currentUserProfile.value?.id ?? null,
      })

      if (error) throw error
    }

    dialogVisible.value = false
    successMessage.value = editingAnnouncement.value
      ? "Announcement updated."
      : "Announcement created."
    setTimeout(() => (successMessage.value = ""), 3000)
    await fetchAnnouncements()
  } catch (error) {
    console.error("Error saving announcement:", error)
    errorMessage.value = error.message || "Failed to save announcement."
  } finally {
    saving.value = false
  }
}

const confirmDelete = (announcement) => {
  announcementToDelete.value = announcement
  deleteDialogVisible.value = true
}

const deleteAnnouncement = async () => {
  if (!announcementToDelete.value) return

  deleting.value = true
  errorMessage.value = ""

  try {
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", announcementToDelete.value.id)

    if (error) throw error

    deleteDialogVisible.value = false
    successMessage.value = "Announcement deleted."
    setTimeout(() => (successMessage.value = ""), 3000)
    await fetchAnnouncements()
  } catch (error) {
    console.error("Error deleting announcement:", error)
    errorMessage.value = error.message || "Failed to delete announcement."
  } finally {
    deleting.value = false
    announcementToDelete.value = null
  }
}

onMounted(() => {
  fetchAnnouncements()
})
</script>
