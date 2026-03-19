<template>
  <div class="manage-races">
    <Message v-if="errorMessage" severity="error" class="mb-4">
      {{ errorMessage }}
    </Message>

    <Message v-if="successMessage" severity="success" class="mb-4">
      {{ successMessage }}
    </Message>

    <div class="grid grid-cols-2 item-center gap-4 mb-6">
      <InputText
        v-model="filters.global.value"
        placeholder="Filter elections by name..."
      />
      <div class="text-right">
        <Button
          v-if="isSuperAdmin"
          class="w-fit"
          label="Add New Election"
          icon="pi pi-plus"
          @click="openDialog()"
        />
      </div>
    </div>

    <!-- Upcoming Elections -->
    <h2 class="text-xl font-semibold mb-4">Upcoming Elections</h2>
    <DataTable
      :value="upcomingRaces"
      :loading="loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 25, 50]"
      stripedRows
      v-model:filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['name', 'state', 'city', 'type']"
      class="p-datatable-sm mb-8"
    >
      <Column field="name" header="Name" sortable>
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <Tag v-if="data.draft" severity="warning" value="Draft" />
            {{ data.name }}
          </div>
        </template>
      </Column>

      <Column field="type" header="Type" sortable />

      <Column field="state" header="State" sortable />

      <Column field="district" header="District" sortable />

      <Column field="primary_date" header="Primary Date" sortable>
        <template #body="{ data }">
          {{
            data.primary_date ? new Date(data.primary_date).toLocaleDateString() : "N/A"
          }}
        </template>
      </Column>

      <Column field="election_date" header="Election Date" sortable>
        <template #body="{ data }">
          {{
            data.election_date ? new Date(data.election_date).toLocaleDateString() : "N/A"
          }}
        </template>
      </Column>

      <Column v-if="isSuperAdmin" style="width: 15rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <NuxtLink
              :to="`https://votebyvalues.com/race/${data.slug}`"
              target="_blank"
              rel="noopener"
            >
              <Button
                icon="pi pi-eye"
                severity="secondary"
                size="small"
                v-tooltip.bottom="'View on Site'"
            /></NuxtLink>
            <Button
              icon="pi pi-users"
              severity="secondary"
              size="small"
              @click="manageCandidates(data)"
              v-tooltip.bottom="'Manage Candidates'"
            />
            <Button
              icon="pi pi-link"
              severity="secondary"
              size="small"
              @click="manageKeyLinks(data)"
              v-tooltip.bottom="'Manage Key Links'"
            />
            <Button
              icon="pi pi-chart-bar"
              severity="success"
              size="small"
              @click="manageSurvey(data)"
              v-tooltip.bottom="'Manage Survey'"
            />
            <Button
              icon="pi pi-pencil"
              severity="info"
              size="small"
              @click="openDialog(data)"
              v-tooltip.bottom="'Edit'"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              size="small"
              @click="confirmDelete(data)"
              v-tooltip.bottom="'Delete'"
            />
          </div>
        </template>
      </Column>

      <Column v-else-if="isRaceAdmin" style="width: 15rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-users"
              severity="secondary"
              size="small"
              @click="manageCandidates(data)"
              v-tooltip.bottom="'Manage Candidates'"
            />
            <Button
              icon="pi pi-link"
              severity="secondary"
              size="small"
              @click="manageKeyLinks(data)"
              v-tooltip.bottom="'Manage Key Links'"
            />
            <Button
              icon="pi pi-chart-bar"
              severity="success"
              size="small"
              @click="manageSurvey(data)"
              v-tooltip.bottom="'Manage Survey'"
            />
            <NuxtLink
              :to="`https://votebyvalues.com/race/${data.slug}`"
              target="_blank"
              rel="noopener"
            >
              <Button
                icon="pi pi-eye"
                severity="secondary"
                size="small"
                v-tooltip.bottom="'View on Site'"
            /></NuxtLink>
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="text-center py-8">No upcoming elections found.</div>
      </template>
    </DataTable>

    <!-- Past Elections -->
    <h2 class="text-xl font-semibold mb-4 mt-12">Past Elections</h2>
    <DataTable
      :value="pastRaces"
      :loading="loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 25, 50]"
      stripedRows
      v-model:filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['name', 'state', 'city', 'type']"
      class="p-datatable-sm"
    >
      <Column field="name" header="Name" sortable>
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <Tag v-if="data.draft" severity="warning" value="Draft" />
            {{ data.name }}
          </div>
        </template>
      </Column>

      <Column field="type" header="Type" sortable />

      <Column field="state" header="State" sortable />

      <Column field="district" header="District" sortable />

      <Column field="primary_date" header="Primary Date" sortable>
        <template #body="{ data }">
          {{
            data.primary_date ? new Date(data.primary_date).toLocaleDateString() : "N/A"
          }}
        </template>
      </Column>

      <Column field="election_date" header="Election Date" sortable>
        <template #body="{ data }">
          {{
            data.election_date ? new Date(data.election_date).toLocaleDateString() : "N/A"
          }}
        </template>
      </Column>

      <Column v-if="isSuperAdmin" style="width: 15rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <NuxtLink
              :to="`https://votebyvalues.com/race/${data.slug}`"
              target="_blank"
              rel="noopener"
            >
              <Button
                icon="pi pi-eye"
                severity="secondary"
                size="small"
                v-tooltip.bottom="'View on Site'"
            /></NuxtLink>
            <Button
              icon="pi pi-users"
              severity="secondary"
              size="small"
              @click="manageCandidates(data)"
              v-tooltip.bottom="'Manage Candidates'"
            />
            <Button
              icon="pi pi-link"
              severity="secondary"
              size="small"
              @click="manageKeyLinks(data)"
              v-tooltip.bottom="'Manage Key Links'"
            />
            <Button
              icon="pi pi-chart-bar"
              severity="success"
              size="small"
              @click="manageSurvey(data)"
              v-tooltip.bottom="'Manage Survey'"
            />
            <Button
              icon="pi pi-pencil"
              severity="info"
              size="small"
              @click="openDialog(data)"
              v-tooltip.bottom="'Edit'"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              size="small"
              @click="confirmDelete(data)"
              v-tooltip.bottom="'Delete'"
            />
          </div>
        </template>
      </Column>

      <Column v-else-if="isRaceAdmin" style="width: 15rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <NuxtLink
              :to="`https://votebyvalues.com/race/${data.slug}`"
              target="_blank"
              rel="noopener"
            >
              <Button
                icon="pi pi-eye"
                severity="secondary"
                size="small"
                v-tooltip.bottom="'View on Site'"
            /></NuxtLink>
            <Button
              icon="pi pi-users"
              severity="secondary"
              size="small"
              @click="manageCandidates(data)"
              v-tooltip.bottom="'Manage Candidates'"
            />
            <Button
              icon="pi pi-link"
              severity="secondary"
              size="small"
              @click="manageKeyLinks(data)"
              v-tooltip.bottom="'Manage Key Links'"
            />
            <Button
              icon="pi pi-chart-bar"
              severity="success"
              size="small"
              @click="manageSurvey(data)"
              v-tooltip.bottom="'Manage Survey'"
            />
            <Button
              icon="pi pi-pencil"
              severity="info"
              size="small"
              @click="openDialog(data)"
              v-tooltip.bottom="'Edit'"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="text-center py-8">No past elections found.</div>
      </template>
    </DataTable>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editingRace ? 'Edit Election' : 'Add New Election'"
      :modal="true"
      :style="{ width: '50vw' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    >
      <form @submit.prevent="saveRace" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="name" class="font-semibold required">Election Name</label>
          <InputText
            id="name"
            v-model="formData.name"
            required
            placeholder="e.g., U.S. House District 5"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="type" class="font-semibold">Type</label>
          <Select
            id="type"
            v-model="formData.type"
            :options="raceTypes"
            placeholder="Select election type"
            class="w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="state" class="font-semibold">State</label>
            <Select
              id="state"
              v-model="formData.state"
              :options="usStates"
              placeholder="Select state"
              class="w-full"
              filter
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="city" class="font-semibold">City</label>
            <InputText
              id="city"
              v-model="formData.city"
              placeholder="e.g., Los Angeles"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="district" class="font-semibold">District</label>
            <InputNumber
              id="district"
              v-model="formData.district"
              placeholder="e.g., 5"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="election_date" class="font-semibold">Election Date</label>
            <DatePicker id="election_date" v-model="formData.election_date" />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="slug" class="font-semibold">Slug</label>
          <InputText
            id="slug"
            v-model="formData.slug"
            placeholder="e.g., ca-house-5"
            @blur="validateSlug"
            :class="{ 'p-invalid': slugError }"
          />
          <small v-if="slugError" class="text-red-500">{{ slugError }}</small>
          <small v-else class="text-gray-500"
            >URL-friendly identifier (auto-generated from name if left blank)</small
          >
        </div>

        <div class="flex flex-col gap-2">
          <label for="description" class="font-semibold">Description</label>
          <SimpleEditor
            id="description"
            v-model="formData.description"
            rows="4"
            placeholder="Brief description of the election"
          />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox id="draft" v-model="formData.draft" :binary="true" />
          <label for="draft">Draft (not publicly visible)</label>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <Button
            label="Cancel"
            severity="secondary"
            @click="dialogVisible = false"
            type="button"
          />
          <Button
            :label="editingRace ? 'Update' : 'Create'"
            type="submit"
            :loading="saving"
            :disabled="!!slugError"
          />
        </div>
      </form>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="Confirm Delete"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem"></i>
        <span>
          Are you sure you want to delete <strong>{{ raceToDelete?.name }}</strong
          >? This action cannot be undone.
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
          @click="deleteRace"
          :loading="deleting"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { FilterMatchMode } from "@primevue/core/api"

const client = useSupabaseClient()
const user = useSupabaseUser()
const currentUserProfile = useCurrentUserProfile()

const races = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref("")
const successMessage = ref("")
const slugError = ref("")

const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingRace = ref(null)
const raceToDelete = ref(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const raceTypes = ["presidential", "gubernatorial", "congress", "special election"]

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
  type: "",
  state: "",
  city: "",
  district: null,
  slug: "",
  description: "",
  election_date: null,
  draft: true,
})

// Check if user is super admin
const isSuperAdmin = computed(() => currentUserProfile.value?.role === "super_admin")
const isRaceAdmin = computed(() => currentUserProfile.value?.role === "election_manager")

// Split races into upcoming and past
const upcomingRaces = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return races.value
    .filter((race) => {
      const primaryDate = race.primary_date ? new Date(race.primary_date) : null
      const electionDate = race.election_date ? new Date(race.election_date) : null

      // Include if either date is today or in the future
      if (primaryDate && primaryDate >= today) return true
      if (electionDate && electionDate >= today) return true
      return false
    })
    .sort((a, b) => {
      // Get the earliest upcoming date for each race
      const getPrimaryOrElectionDate = (race) => {
        const primaryDate = race.primary_date ? new Date(race.primary_date) : null
        const electionDate = race.election_date ? new Date(race.election_date) : null

        // Return the earliest date that's still upcoming
        if (primaryDate && primaryDate >= today) {
          if (electionDate && electionDate >= today) {
            return primaryDate < electionDate ? primaryDate : electionDate
          }
          return primaryDate
        }
        return electionDate
      }

      const dateA = getPrimaryOrElectionDate(a)
      const dateB = getPrimaryOrElectionDate(b)

      // Sort by soonest date first (ascending)
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      return dateA - dateB
    })
})

const pastRaces = computed(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return races.value.filter((race) => {
    const primaryDate = race.primary_date ? new Date(race.primary_date) : null
    const electionDate = race.election_date ? new Date(race.election_date) : null

    // Include only if both dates are in the past (or null)
    const primaryInPast = !primaryDate || primaryDate < today
    const electionInPast = !electionDate || electionDate < today

    return primaryInPast && electionInPast && (primaryDate || electionDate)
  })
})

// Check if user can edit a specific race
const canEditRace = (race) => {
  if (isSuperAdmin.value) return true
  if (isRaceAdmin.value && race.admin_id === user.value?.sub) return true
  return false
}

// Fetch all races
const fetchRaces = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    let query = client.from("races").select("*")

    // If user is election_manager, only fetch their races
    if (isRaceAdmin.value && !isSuperAdmin.value) {
      query = query.eq("admin_id", user.value.sub)
    }

    query = query.order("election_date", { ascending: false })

    const { data, error } = await query

    if (error) throw error
    races.value = data || []
  } catch (error) {
    console.error("Error fetching races:", error)
    errorMessage.value = "Failed to load races. Please try again."
  } finally {
    loading.value = false
  }
}

// Generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// Open dialog for create or edit
const openDialog = (race = null) => {
  slugError.value = "" // Clear any previous slug error

  if (race) {
    // Check if user has permission to edit this race
    if (!canEditRace(race)) {
      errorMessage.value = "You do not have permission to edit this race."
      return
    }

    editingRace.value = race
    formData.value = {
      name: race.name || "",
      type: race.type || "",
      state: race.state || "",
      city: race.city || "",
      district: race.district,
      slug: race.slug || "",
      description: race.description || "",
      election_date: race.election_date ? new Date(race.election_date) : null,
      draft: race.draft !== false,
    }
  } else {
    editingRace.value = null
    formData.value = {
      name: "",
      type: "",
      state: "",
      city: "",
      district: null,
      slug: "",
      description: "",
      election_date: null,
      draft: true,
    }
  }
  dialogVisible.value = true
  successMessage.value = ""
  errorMessage.value = ""
}

// Check if slug already exists
const checkSlugExists = async (slug, excludeId = null) => {
  const query = client.from("races").select("id").eq("slug", slug)

  if (excludeId) {
    query.neq("id", excludeId)
  }

  const { data, error } = await query

  if (error) throw error
  return data && data.length > 0
}

// Validate slug on blur
const validateSlug = async () => {
  slugError.value = ""

  if (!formData.value.slug || formData.value.slug.trim() === "") {
    return
  }

  try {
    const exists = await checkSlugExists(formData.value.slug, editingRace.value?.id)

    if (exists) {
      slugError.value = "This slug is already in use. Please choose a different one."
    }
  } catch (error) {
    console.error("Error validating slug:", error)
  }
}

// Save race (create or update)
const saveRace = async () => {
  saving.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    // Auto-generate slug if not provided
    if (!formData.value.slug && formData.value.name) {
      formData.value.slug = generateSlug(formData.value.name)
    }

    // Validate slug uniqueness
    if (formData.value.slug) {
      const slugExists = await checkSlugExists(formData.value.slug, editingRace.value?.id)

      if (slugExists) {
        errorMessage.value = `The slug "${formData.value.slug}" is already in use. Please choose a different slug.`
        saving.value = false
        return
      }
    }

    const raceData = {
      name: formData.value.name,
      type: formData.value.type || null,
      state: formData.value.state || null,
      city: formData.value.city || null,
      district: formData.value.district || null,
      slug: formData.value.slug || null,
      description: formData.value.description || null,
      election_date: formData.value.election_date
        ? formData.value.election_date.toISOString()
        : null,
      draft: formData.value.draft,
    }

    if (editingRace.value) {
      // Check permission before updating
      if (!canEditRace(editingRace.value)) {
        errorMessage.value = "You do not have permission to edit this race."
        saving.value = false
        return
      }

      // Update existing race
      const { error } = await client
        .from("races")
        .update(raceData)
        .eq("id", editingRace.value.id)

      if (error) throw error

      successMessage.value = "Race updated successfully!"
    } else {
      // Create new race
      // If user is election_manager, set them as admin_id
      if (isRaceAdmin.value && !isSuperAdmin.value) {
        raceData.admin_id = user.value.id
      }

      const { error } = await client.from("races").insert([raceData])

      if (error) throw error

      successMessage.value = "Race created successfully!"
    }

    dialogVisible.value = false
    await fetchRaces()
  } catch (error) {
    console.error("Error saving race:", error)
    errorMessage.value = error.message || "Failed to save race. Please try again."
  } finally {
    saving.value = false
  }
}

// Confirm delete
const confirmDelete = (race) => {
  // Check if user has permission to delete this race
  if (!canEditRace(race)) {
    errorMessage.value = "You do not have permission to delete this race."
    return
  }

  raceToDelete.value = race
  deleteDialogVisible.value = true
  successMessage.value = ""
  errorMessage.value = ""
}

// Navigate to manage candidates for this race
const manageCandidates = (race) => {
  // You can implement this to navigate to a candidates management page
  // filtered by this race, or open a dialog, etc.
  navigateTo(`/candidates/${race.slug}`)
}

// Navigate to manage key links for this race
const manageKeyLinks = (race) => {
  navigateTo(`/key-links?race_id=${race.id}`)
}

// Navigate to manage survey for this race
const manageSurvey = async (race) => {
  // Check if user has permission to manage this race's survey
  if (!canEditRace(race)) {
    errorMessage.value = "You do not have permission to manage this race's survey."
    return
  }

  try {
    // Check if survey exists for this race
    const { data: existingSurvey, error: fetchError } = await client
      .from("surveys")
      .select("*")
      .eq("race_slug", race.slug)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected if no survey exists
      throw fetchError
    }

    if (existingSurvey) {
      // Survey exists, navigate to questions page
      navigateTo(`/surveys/${existingSurvey.id}/questions`)
    } else {
      // No survey exists, create one
      const { data: newSurvey, error: createError } = await client
        .from("surveys")
        .insert([
          {
            name: `${race.name} Survey`,
            description: `Survey for ${race.name}`,
            state: race.state,
            race_slug: race.slug,
          },
        ])
        .select()
        .single()

      if (createError) throw createError

      // Navigate to the new survey's questions page
      navigateTo(`/surveys/${newSurvey.id}/questions`)
    }
  } catch (error) {
    console.error("Error managing survey:", error)
    errorMessage.value = `Failed to manage survey: ${error.message}`
  }
}

// Delete race
const deleteRace = async () => {
  deleting.value = true
  errorMessage.value = ""

  try {
    const { error } = await client.from("races").delete().eq("id", raceToDelete.value.id)

    if (error) throw error

    successMessage.value = "Race deleted successfully!"
    deleteDialogVisible.value = false
    await fetchRaces()
  } catch (error) {
    console.error("Error deleting race:", error)
    errorMessage.value = error.message || "Failed to delete race. Please try again."
  } finally {
    deleting.value = false
  }
}

// Clear slug error when user modifies the slug
watch(
  () => formData.value.slug,
  () => {
    if (slugError.value) {
      slugError.value = ""
    }
  }
)

// Load races on mount
onMounted(async () => {
  await fetchRaces()
})
</script>

<style scoped>
.manage-races {
  padding: 1rem;
}
</style>
