<template>
  <div class="manage-surveys">
    <div class="mb-4 flex justify-between items-center">
      <Button
        label="Create New Survey"
        icon="pi pi-plus"
        @click="openCreateDialog"
        :disabled="!isSuperAdmin"
      />
    </div>

    <Message v-if="errorMessage" severity="error" class="mb-4">
      {{ errorMessage }}
    </Message>

    <Message v-if="successMessage" severity="success" class="mb-4" :closable="false">
      {{ successMessage }}
    </Message>

    <ProgressSpinner v-if="loading" class="my-8" />

    <DataTable
      v-else
      :value="surveys"
      :paginator="true"
      :rows="10"
      :filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['name', 'description', 'state', 'race_slug']"
      sortMode="multiple"
      tableStyle="min-width: 50rem"
    >
      <template #header>
        <div class="flex justify-between">
          <InputText
            v-model="filters['global'].value"
            placeholder="Search surveys..."
            class="w-full max-w-xs"
          />
        </div>
      </template>

      <template #empty> No surveys found. </template>

      <Column field="name" header="Survey Name" sortable style="min-width: 15rem">
        <template #body="{ data }">
          <strong>{{ data.name }}</strong>
        </template>
      </Column>

      <Column field="description" header="Description" sortable style="min-width: 20rem">
        <template #body="{ data }">
          <div class="text-sm text-gray-600">
            {{ data.description || "No description" }}
          </div>
        </template>
      </Column>

      <Column field="state" header="State" sortable style="width: 10rem">
        <template #body="{ data }">
          {{ data.state }}
        </template>
      </Column>

      <Column field="race_slug" header="Race" sortable style="min-width: 12rem">
        <template #body="{ data }">
          {{ data.race_slug }}
        </template>
      </Column>

      <Column v-if="isSuperAdmin" style="width: 15rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-list"
              severity="info"
              v-tooltip.top="'Manage Questions'"
              @click="manageQuestions(data)"
              text
            />
            <Button
              icon="pi pi-pencil"
              severity="secondary"
              v-tooltip.top="'Edit Survey'"
              @click="openEditDialog(data)"
              text
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              v-tooltip.top="'Delete Survey'"
              @click="confirmDelete(data)"
              text
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editingSurvey ? 'Edit Survey' : 'Create New Survey'"
      :modal="true"
      :style="{ width: '50vw' }"
    >
      <div class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium mb-2">Survey Name *</label>
          <InputText
            id="name"
            v-model="formData.name"
            class="w-full"
            placeholder="Enter survey name"
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium mb-2"
            >Description</label
          >
          <Textarea
            id="description"
            v-model="formData.description"
            rows="4"
            class="w-full"
            placeholder="Enter survey description"
          />
        </div>

        <div>
          <label for="state" class="block text-sm font-medium mb-2">State</label>
          <Select
            id="state"
            v-model="formData.state"
            :options="usStates"
            placeholder="Select state (optional)"
            class="w-full"
            showClear
          />
        </div>

        <div>
          <label for="race_slug" class="block text-sm font-medium mb-2">Race Slug</label>
          <InputText
            id="race_slug"
            v-model="formData.race_slug"
            class="w-full"
            placeholder="Enter race slug (optional)"
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" @click="dialogVisible = false" text />
        <Button
          :label="editingSurvey ? 'Update' : 'Create'"
          @click="saveSurvey"
          :loading="saving"
          :disabled="!formData.name"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="Confirm Delete"
      :modal="true"
      :style="{ width: '30vw' }"
    >
      <p>
        Are you sure you want to delete the survey
        <strong>{{ surveyToDelete?.name }}</strong
        >? This action cannot be undone.
      </p>
      <template #footer>
        <Button label="Cancel" @click="deleteDialogVisible = false" text />
        <Button
          label="Delete"
          severity="danger"
          @click="deleteSurvey"
          :loading="deleting"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { FilterMatchMode } from "@primevue/core/api"

const client = useSupabaseClient()
const currentUserProfile = useCurrentUserProfile()

const surveys = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingSurvey = ref(null)
const surveyToDelete = ref(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const usStates = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]

const formData = ref({
  name: "",
  description: "",
  state: null,
  race_slug: "",
})

// Check if user is super admin
const isSuperAdmin = computed(() => currentUserProfile.value?.role === "super_admin")

// Fetch all surveys
const fetchSurveys = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    const { data, error } = await client.from("surveys").select("*").order("id")

    if (error) throw error
    surveys.value = data || []
  } catch (error) {
    console.error("Error fetching surveys:", error)
    errorMessage.value = "Failed to load surveys. Please try again."
  } finally {
    loading.value = false
  }
}

// Open create dialog
const openCreateDialog = () => {
  editingSurvey.value = null
  formData.value = {
    name: "",
    description: "",
    state: null,
    race_slug: "",
  }
  dialogVisible.value = true
}

// Open edit dialog
const openEditDialog = (survey) => {
  editingSurvey.value = survey
  formData.value = {
    name: survey.name,
    description: survey.description || "",
    state: survey.state,
    race_slug: survey.race_slug || "",
  }
  dialogVisible.value = true
}

// Save survey (create or update)
const saveSurvey = async () => {
  if (!formData.value.name) {
    errorMessage.value = "Survey name is required"
    return
  }

  saving.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    const surveyData = {
      name: formData.value.name,
      description: formData.value.description || null,
      state: formData.value.state || null,
      race_slug: formData.value.race_slug || null,
    }

    if (editingSurvey.value) {
      // Update existing survey
      const { error } = await client
        .from("surveys")
        .update(surveyData)
        .eq("id", editingSurvey.value.id)

      if (error) throw error
      successMessage.value = "Survey updated successfully!"
    } else {
      // Create new survey
      const { error } = await client.from("surveys").insert([surveyData])

      if (error) throw error
      successMessage.value = "Survey created successfully!"
    }

    dialogVisible.value = false
    await fetchSurveys()

    setTimeout(() => {
      successMessage.value = ""
    }, 3000)
  } catch (error) {
    console.error("Error saving survey:", error)
    errorMessage.value = `Failed to save survey: ${error.message}`
  } finally {
    saving.value = false
  }
}

// Confirm delete
const confirmDelete = (survey) => {
  surveyToDelete.value = survey
  deleteDialogVisible.value = true
}

// Delete survey
const deleteSurvey = async () => {
  if (!surveyToDelete.value) return

  deleting.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    const { error } = await client
      .from("surveys")
      .delete()
      .eq("id", surveyToDelete.value.id)

    if (error) throw error

    successMessage.value = "Survey deleted successfully!"
    deleteDialogVisible.value = false
    await fetchSurveys()

    setTimeout(() => {
      successMessage.value = ""
    }, 3000)
  } catch (error) {
    console.error("Error deleting survey:", error)
    errorMessage.value = `Failed to delete survey: ${error.message}`
  } finally {
    deleting.value = false
  }
}

// Navigate to manage questions
const manageQuestions = (survey) => {
  navigateTo(`/surveys/${survey.id}/questions`)
}

// Fetch surveys on mount
onMounted(() => {
  fetchSurveys()
})
</script>

<style lang="scss" scoped>
.manage-surveys {
  :deep(.p-datatable) {
    .p-datatable-header {
      background: transparent;
      border: none;
      padding: 1rem 0;
    }
  }
}
</style>
