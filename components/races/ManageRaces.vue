<template>
  <div class="manage-races">
    <Message v-if="errorMessage" severity="error" class="mb-4">
      {{ errorMessage }}
    </Message>

    <Message v-if="successMessage" severity="success" class="mb-4">
      {{ successMessage }}
    </Message>

    <div class="grid grid-cols-2 item-center gap-4 mb-6">
      <InputText v-model="filters.global.value" placeholder="Search races..." />
      <div class="text-right">
        <Button class="w-fit" label="Add Race" icon="pi pi-plus" @click="openDialog()" />
      </div>
    </div>

    <DataTable
      :value="races"
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
      <Column field="name" header="Race Name" sortable>
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <Tag v-if="data.draft" severity="warning" value="Draft" />
            {{ data.name }}
          </div>
        </template>
      </Column>

      <Column field="type" header="Type" sortable />

      <Column field="state" header="State" sortable />

      <Column field="city" header="City" sortable />

      <Column field="district" header="District" sortable />

      <Column field="election_date" header="Election Date" sortable>
        <template #body="{ data }">
          {{
            data.election_date ? new Date(data.election_date).toLocaleDateString() : "N/A"
          }}
        </template>
      </Column>

      <Column style="width: 12rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              severity="info"
              size="small"
              @click="openDialog(data)"
              title="Edit"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              size="small"
              @click="confirmDelete(data)"
              title="Delete"
            />
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="text-center py-8">
          No races found. Click "Add New Race" to create one.
        </div>
      </template>
    </DataTable>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editingRace ? 'Edit Race' : 'Add New Race'"
      :modal="true"
      :style="{ width: '50vw' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    >
      <form @submit.prevent="saveRace" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="name" class="font-semibold required">Race Name</label>
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
            placeholder="Select race type"
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
          <InputText id="slug" v-model="formData.slug" placeholder="e.g., ca-house-5" />
          <small class="text-gray-500"
            >URL-friendly identifier (auto-generated from name if left blank)</small
          >
        </div>

        <div class="flex flex-col gap-2">
          <label for="description" class="font-semibold">Description</label>
          <Textarea
            id="description"
            v-model="formData.description"
            rows="4"
            placeholder="Brief description of the race"
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

const races = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

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

// Fetch all races
const fetchRaces = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    const { data, error } = await client
      .from("races")
      .select("*")
      .order("election_date", { ascending: false })

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
  if (race) {
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
      // Update existing race
      const { error } = await client
        .from("races")
        .update(raceData)
        .eq("id", editingRace.value.id)

      if (error) throw error

      successMessage.value = "Race updated successfully!"
    } else {
      // Create new race
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
  raceToDelete.value = race
  deleteDialogVisible.value = true
  successMessage.value = ""
  errorMessage.value = ""
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

// Load races on mount
onMounted(() => {
  fetchRaces()
})
</script>

<style scoped>
.manage-races {
  padding: 1rem;
}

label.required::after {
  content: " *";
  color: var(--red);
}
</style>
