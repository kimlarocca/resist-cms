<template>
  <div>
    <!-- Error message for non-super admins -->
    <Message v-if="!isSuperAdmin" severity="error" class="mb-4">
      <p class="font-semibold">Access Denied</p>
      <p>You must be a Super Admin to access this page.</p>
    </Message>

    <!-- Content for super admins only -->
    <template v-else>
      <div class="grid grid-cols-2 items-center gap-4 mb-6">
        <InputText
          v-model="filters.global.value"
          placeholder="Filter groups by title..."
        />
        <div class="text-right">
          <Button
            label="Add New Group"
            icon="pi pi-plus"
            @click="addNewWebsite"
            class="p-button-success"
          />
        </div>
      </div>

      <DataTable
        :value="websites"
        :loading="loading"
        stripedRows
        v-model:filters="filters"
        filterDisplay="menu"
        :globalFilterFields="['title', 'url', 'email', 'type']"
        class="p-datatable-sm"
      >
        <Column field="title" header="Title" sortable>
          <template #body="slotProps">
            {{ slotProps.data.title || "Untitled" }}
          </template>
        </Column>

        <Column field="url" header="URL" sortable>
          <template #body="slotProps">
            <a
              :href="slotProps.data.url"
              target="_blank"
              class="text-blue-600 hover:underline"
            >
              {{ slotProps.data?.url }}
            </a>
          </template>
        </Column>

        <Column field="type" header="Type" sortable>
          <template #body="slotProps">
            {{ slotProps.data?.type }}
          </template>
        </Column>

        <Column field="email" header="Email">
          <template #body="slotProps">
            {{ slotProps.data?.email }}
          </template>
        </Column>

        <Column header="Actions" style="width: 250px">
          <template #body="slotProps">
            <div class="flex gap-2">
              <Button
                icon="pi pi-pencil"
                severity="info"
                size="small"
                @click="editWebsite(slotProps.data.id)"
                v-tooltip.top="'Edit'"
              />
              <Button
                v-if="slotProps.data.type === 'visibility-brigade'"
                icon="pi pi-file-edit"
                severity="secondary"
                size="small"
                @click="manageVisibilityBrigade(slotProps.data.id)"
                v-tooltip.top="'Manage Content'"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                size="small"
                @click="confirmDelete(slotProps.data)"
                v-tooltip.top="'Delete'"
              />
            </div>
          </template>
        </Column>
      </DataTable>

      <!-- Delete Confirmation Dialog -->
      <Dialog
        v-model:visible="deleteDialogVisible"
        :style="{ width: '450px' }"
        header="Confirm Delete"
        :modal="true"
      >
        <div class="flex align-items-center gap-3">
          <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
          <span>
            Are you sure you want to delete
            <strong>{{ websiteToDelete?.title || websiteToDelete?.url }}</strong
            >?
          </span>
        </div>
        <template #footer>
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="deleteDialogVisible = false"
            text
          />
          <Button
            label="Delete"
            icon="pi pi-check"
            @click="deleteWebsite"
            severity="danger"
          />
        </template>
      </Dialog>

      <!-- Add Website Dialog -->
      <Dialog
        v-model:visible="addDialogVisible"
        :style="{ width: '450px' }"
        header="Add New Website"
        :modal="true"
      >
        <div class="mb-4 mt-6">
          <FloatLabel variant="on">
            <InputText
              id="newWebsiteUrl"
              v-model="newWebsiteUrl"
              class="w-full"
              :class="{ 'p-invalid': urlError }"
            />
            <label for="newWebsiteUrl">Website URL*</label>
          </FloatLabel>
          <small v-if="urlError" class="p-error">{{ urlError }}</small>
        </div>
        <template #footer>
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="addDialogVisible = false"
            text
          />
          <Button
            label="Add"
            icon="pi pi-check"
            @click="saveNewWebsite"
            :loading="saving"
          />
        </template>
      </Dialog>
    </template>
  </div>
</template>

<script setup>
import { FilterMatchMode } from "@primevue/core/api"

const supabase = useSupabaseClient()
const router = useRouter()
const currentUserProfile = useCurrentUserProfile()

const websites = ref([])
const loading = ref(true)
const deleteDialogVisible = ref(false)
const addDialogVisible = ref(false)
const websiteToDelete = ref(null)
const newWebsiteUrl = ref("")
const urlError = ref("")
const saving = ref(false)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

// Check if user is super admin
const isSuperAdmin = computed(() => {
  return currentUserProfile.value?.role === "super_admin"
})

// Fetch all websites
const fetchWebsites = async () => {
  loading.value = true

  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching websites:", error)
  } else {
    websites.value = data || []
  }

  loading.value = false
}

// Navigate to edit page
const editWebsite = (id) => {
  router.push(`/groups/${id}`)
}

// Show add dialog
const addNewWebsite = () => {
  newWebsiteUrl.value = ""
  urlError.value = ""
  addDialogVisible.value = true
}

// Validate and save new website
const saveNewWebsite = async () => {
  urlError.value = ""

  // Basic URL validation
  if (!newWebsiteUrl.value) {
    urlError.value = "URL is required"
    return
  }

  // Check if URL starts with http:// or https://
  if (
    !newWebsiteUrl.value.startsWith("http://") &&
    !newWebsiteUrl.value.startsWith("https://")
  ) {
    urlError.value = "URL must start with http:// or https://"
    return
  }

  saving.value = true

  const { data, error } = await supabase
    .from("websites")
    .insert([
      {
        url: newWebsiteUrl.value,
        title: "",
        description: "",
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Error adding website:", error)
    urlError.value = "Error adding website. Please try again."
  } else {
    addDialogVisible.value = false
    fetchWebsites()
    // Navigate to edit the new website
    if (data?.id) {
      router.push(`/${data.id}`)
    }
  }

  saving.value = false
}

// Navigate to manage visibility brigade content
const manageVisibilityBrigade = (websiteId) => {
  router.push(`/groups/${websiteId}/manage`)
}

// Show delete confirmation
const confirmDelete = (website) => {
  websiteToDelete.value = website
  deleteDialogVisible.value = true
}

// Delete website
const deleteWebsite = async () => {
  if (!websiteToDelete.value) return

  const { error } = await supabase
    .from("websites")
    .delete()
    .eq("id", websiteToDelete.value.id)

  if (error) {
    console.error("Error deleting website:", error)
  } else {
    fetchWebsites()
  }

  deleteDialogVisible.value = false
  websiteToDelete.value = null
}

// Fetch websites on component mount
onMounted(() => {
  fetchWebsites()
})
</script>

<style scoped>
:deep(.p-datatable) {
  font-size: 0.875rem;
}
</style>
