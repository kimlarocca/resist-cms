<template>
  <div class="manage-key-links">
    <Message v-if="errorMessage" severity="error" class="mb-4">
      {{ errorMessage }}
    </Message>

    <Message v-if="successMessage" severity="success" class="mb-4">
      {{ successMessage }}
    </Message>

    <div v-if="props.raceId || props.candidateId" class="mb-4">
      <Message severity="info" :closable="false">
        <div class="flex items-center justify-between">
          <div>
            <strong>Filtered View:</strong>
            <span v-if="props.raceId"> Showing links for {{ getRaceName(props.raceId) }}</span>
            <span v-if="props.candidateId"> Showing links for {{ getCandidateName(props.candidateId) }}</span>
          </div>
          <Button
            label="View All Key Links"
            icon="pi pi-list"
            size="small"
            severity="secondary"
            @click="navigateTo('/key-links')"
          />
        </div>
      </Message>
    </div>

    <div class="grid grid-cols-2 item-center gap-4 mb-6">
      <InputText v-model="filters.global.value" placeholder="Search key links..." />
      <div class="text-right">
        <Button
          class="w-fit"
          label="Add Key Link"
          icon="pi pi-plus"
          @click="openDialog()"
        />
      </div>
    </div>

    <DataTable
      :value="keyLinks"
      :loading="loading"
      paginator
      :rows="50"
      :rowsPerPageOptions="[10, 25, 50]"
      stripedRows
      v-model:filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['name', 'description', 'url', 'source_name']"
      class="p-datatable-sm"
    >
      <Column field="name" header="Name" sortable>
        <template #body="{ data }">
          <div class="flex items-center gap-2">
            <i
              v-if="data.endorsement"
              class="pi pi-heart-fill text-red-500"
              v-tooltip.top="'Endorsement'"
            ></i>
            {{ data.name }}
          </div>
        </template>
      </Column>

      <Column field="url" header="URL" sortable>
        <template #body="{ data }">
          <a
            :href="data.url"
            target="_blank"
            rel="noopener"
            class="text-blue-600 hover:underline"
          >
            {{ data.url }}
          </a>
        </template>
      </Column>

      <Column field="race_id" header="Race" sortable>
        <template #body="{ data }">
          {{ getRaceName(data.race_id) }}
        </template>
      </Column>

      <Column field="candidate_id" header="Candidate" sortable>
        <template #body="{ data }">
          {{ getCandidateName(data.candidate_id) }}
        </template>
      </Column>

      <Column field="source_name" header="Source" sortable />

      <Column style="width: 10rem">
        <template #body="{ data }">
          <div class="flex gap-2">
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

      <template #empty>
        <div class="text-center py-8">
          No key links found. Click "Add Key Link" to create one.
        </div>
      </template>
    </DataTable>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editingKeyLink ? 'Edit Key Link' : 'Add New Key Link'"
      :modal="true"
      :style="{ width: '60vw' }"
      :breakpoints="{ '960px': '80vw', '640px': '95vw' }"
    >
      <form @submit.prevent="saveKeyLink" class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="name" class="font-semibold required">Name</label>
            <InputText
              id="name"
              v-model="formData.name"
              required
              placeholder="Link name"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="url" class="font-semibold required">URL</label>
            <InputText
              id="url"
              v-model="formData.url"
              required
              placeholder="https://..."
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="race_id" :class="['font-semibold', { required: isRaceAdmin }]">
              Race {{ isRaceAdmin ? '(Required)' : '(Optional)' }}
            </label>
            <Select
              id="race_id"
              v-model="formData.race_id"
              :options="availableRaces"
              optionLabel="name"
              optionValue="id"
              placeholder="Select race"
              class="w-full"
              filter
              :showClear="!isRaceAdmin"
              :required="isRaceAdmin"
            />
            <small class="text-gray-500">
              {{ isRaceAdmin ? 'You must associate links with one of your races' : 'Leave empty for general links' }}
            </small>
          </div>

          <div class="flex flex-col gap-2">
            <label for="candidate_id" class="font-semibold">Candidate (Optional)</label>
            <Select
              id="candidate_id"
              v-model="formData.candidate_id"
              :options="filteredCandidates"
              optionLabel="name"
              optionValue="id"
              placeholder="Select candidate"
              class="w-full"
              filter
              showClear
            />
            <small class="text-gray-500">Filtered by selected race</small>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="description" class="font-semibold">Description</label>
          <Textarea
            id="description"
            v-model="formData.description"
            rows="3"
            placeholder="Brief description of this link"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="source_name" class="font-semibold">Source Name</label>
            <InputText
              id="source_name"
              v-model="formData.source_name"
              placeholder="e.g., Official Website, News Article"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="image" class="font-semibold">Image URL</label>
            <InputText id="image" v-model="formData.image" placeholder="https://..." />
          </div>
        </div>

        <Accordion>
          <AccordionTab header="Endorsement Options">
            <div class="flex flex-col gap-4">
              <div class="flex items-center gap-2">
                <Checkbox
                  id="endorsement"
                  v-model="formData.endorsement"
                  :binary="true"
                />
                <label for="endorsement" class="font-semibold">Mark as Endorsement</label>
              </div>

              <div v-if="formData.endorsement" class="flex flex-col gap-2">
                <label for="endorsement_type" class="font-semibold"
                  >Endorsement Type</label
                >
                <InputText
                  id="endorsement_type"
                  v-model="formData.endorsement_type"
                  placeholder="e.g., Individual, Organization, Political"
                />
              </div>
            </div>
          </AccordionTab>
        </Accordion>

        <div class="flex justify-end gap-2 mt-4">
          <Button
            label="Cancel"
            severity="secondary"
            @click="dialogVisible = false"
            type="button"
          />
          <Button
            :label="editingKeyLink ? 'Update' : 'Create'"
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
          Are you sure you want to delete <strong>{{ keyLinkToDelete?.name }}</strong
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
          @click="deleteKeyLink"
          :loading="deleting"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { FilterMatchMode } from "@primevue/core/api"

const props = defineProps({
  raceId: {
    type: Number,
    default: null,
  },
  candidateId: {
    type: Number,
    default: null,
  },
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const userProfile = useCurrentUserProfile()

const keyLinks = ref([])
const availableRaces = ref([])
const availableCandidates = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingKeyLink = ref(null)
const keyLinkToDelete = ref(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const formData = ref({
  name: "",
  description: "",
  url: "",
  race_id: null,
  candidate_id: null,
  endorsement: false,
  endorsement_type: "",
  image: "",
  source_name: "",
})

// Check if user is super admin or race admin
const isSuperAdmin = computed(() => userProfile.value?.role === "super_admin")
const isRaceAdmin = computed(() => userProfile.value?.role === "election_manager")

// Filter candidates by selected race
const filteredCandidates = computed(() => {
  if (!formData.value.race_id) {
    return availableCandidates.value
  }

  const selectedRace = availableRaces.value.find((r) => r.id === formData.value.race_id)
  if (!selectedRace) return availableCandidates.value

  return availableCandidates.value.filter((c) => c.race_slug === selectedRace.slug)
})

// Get race name by ID
const getRaceName = (raceId) => {
  if (!raceId) return "All Races"
  const race = availableRaces.value.find((r) => r.id === raceId)
  return race ? race.name : "N/A"
}

// Get candidate name by ID
const getCandidateName = (candidateId) => {
  if (!candidateId) return "All Candidates"
  const candidate = availableCandidates.value.find((c) => c.id === candidateId)
  return candidate ? candidate.name : "N/A"
}

// Check if user can edit a key link
const canEditKeyLink = (keyLink) => {
  if (isSuperAdmin.value) return true
  if (isRaceAdmin.value && keyLink.race_id) {
    const race = availableRaces.value.find((r) => r.id === keyLink.race_id)
    return race && race.admin_id === userProfile.value?.id
  }
  return false
}

// Fetch available races
const fetchRaces = async () => {
  try {
    let query = client.from("races").select("*")

    // If user is election_manager, only fetch their races
    if (isRaceAdmin.value && !isSuperAdmin.value && userProfile.value?.id) {
      query = query.eq("admin_id", userProfile.value.id)
    }

    const { data, error } = await query

    if (error) throw error

    availableRaces.value = data || []
  } catch (error) {
    console.error("Error fetching races:", error)
    errorMessage.value = "Failed to load races."
  }
}

// Fetch available candidates
const fetchCandidates = async () => {
  try {
    let query = client.from("candidates").select("*").order("name", { ascending: true })

    // If user is election_manager, only fetch candidates for their races
    if (isRaceAdmin.value && !isSuperAdmin.value) {
      const raceSlugs = availableRaces.value.map((r) => r.slug)
      if (raceSlugs.length > 0) {
        query = query.in("race_slug", raceSlugs)
      } else {
        availableCandidates.value = []
        return
      }
    }

    const { data, error } = await query

    if (error) throw error

    availableCandidates.value = data || []
  } catch (error) {
    console.error("Error fetching candidates:", error)
    errorMessage.value = "Failed to load candidates."
  }
}

// Fetch all key links
const fetchKeyLinks = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    // Wait for races to be loaded first
    if (availableRaces.value.length === 0) {
      await fetchRaces()
    }

    console.log('Fetching key links with props:', { 
      raceId: props.raceId, 
      candidateId: props.candidateId,
      isSuperAdmin: isSuperAdmin.value,
      isRaceAdmin: isRaceAdmin.value
    })

    let query = client
      .from("key-links")
      .select("*")
      .order("created_at", { ascending: false })

    // Race admins can only see key links for their races
    if (isRaceAdmin.value && !isSuperAdmin.value) {
      const raceIds = availableRaces.value.map((r) => r.id)
      if (raceIds.length === 0) {
        // No races assigned, so no key links
        keyLinks.value = []
        loading.value = false
        return
      }
      
      // Always filter by race admin's races
      query = query.in("race_id", raceIds)
      
      // Additionally filter by specific race if raceId prop is provided
      if (props.raceId) {
        // Verify the race belongs to this admin
        if (!raceIds.includes(props.raceId)) {
          errorMessage.value = "You do not have permission to view links for this race."
          keyLinks.value = []
          loading.value = false
          return
        }
        console.log('Filtering race admin view by race_id:', props.raceId)
        query = query.eq("race_id", props.raceId)
      }
      // Additionally filter by specific candidate if candidateId prop is provided
      else if (props.candidateId) {
        query = query.eq("candidate_id", props.candidateId)
      }
    } 
    // Super admins can see all key links
    else if (isSuperAdmin.value) {
      // Filter by specific race if raceId prop is provided
      if (props.raceId) {
        console.log('Filtering super admin view by race_id:', props.raceId)
        query = query.eq("race_id", props.raceId)
      }
      // Filter by specific candidate if candidateId prop is provided
      else if (props.candidateId) {
        query = query.eq("candidate_id", props.candidateId)
      }
    }

    const { data, error } = await query

    if (error) throw error

    console.log('Fetched key links:', data)
    keyLinks.value = data || []
  } catch (error) {
    console.error("Error fetching key links:", error)
    errorMessage.value = "Failed to load key links. Please try again."
  } finally {
    loading.value = false
  }
}

// Open dialog for create or edit
const openDialog = (keyLink = null) => {
  if (keyLink) {
    // Check if user has permission to edit this key link
    if (!canEditKeyLink(keyLink)) {
      errorMessage.value = "You do not have permission to edit this key link."
      return
    }

    editingKeyLink.value = keyLink
    formData.value = {
      name: keyLink.name || "",
      description: keyLink.description || "",
      url: keyLink.url || "",
      race_id: keyLink.race_id || null,
      candidate_id: keyLink.candidate_id || null,
      endorsement: keyLink.endorsement || false,
      endorsement_type: keyLink.endorsement_type || "",
      image: keyLink.image || "",
      source_name: keyLink.source_name || "",
    }
  } else {
    editingKeyLink.value = null
    
    // For race admins, default to first available race if not coming from a filtered view
    let defaultRaceId = props.raceId || null
    if (isRaceAdmin.value && !isSuperAdmin.value && !defaultRaceId && availableRaces.value.length > 0) {
      defaultRaceId = availableRaces.value[0].id
    }
    
    formData.value = {
      name: "",
      description: "",
      url: "",
      race_id: defaultRaceId,
      candidate_id: props.candidateId || null,
      endorsement: false,
      endorsement_type: "",
      image: "",
      source_name: "",
    }
  }
  dialogVisible.value = true
  successMessage.value = ""
  errorMessage.value = ""
}

// Save key link (create or update)
const saveKeyLink = async () => {
  saving.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    // Validate race admins must have a race_id
    if (isRaceAdmin.value && !isSuperAdmin.value && !formData.value.race_id) {
      errorMessage.value = "Race administrators must associate key links with a race."
      saving.value = false
      return
    }
    
    // Validate race admins can only create links for their races
    if (isRaceAdmin.value && !isSuperAdmin.value && formData.value.race_id) {
      const raceIds = availableRaces.value.map((r) => r.id)
      if (!raceIds.includes(formData.value.race_id)) {
        errorMessage.value = "You can only create key links for your assigned races."
        saving.value = false
        return
      }
    }

    const keyLinkData = {
      name: formData.value.name,
      description: formData.value.description || null,
      url: formData.value.url,
      race_id: formData.value.race_id || null,
      candidate_id: formData.value.candidate_id || null,
      endorsement: formData.value.endorsement || false,
      endorsement_type: formData.value.endorsement_type || null,
      image: formData.value.image || null,
      source_name: formData.value.source_name || null,
    }

    if (editingKeyLink.value) {
      // Check permission before updating
      if (!canEditKeyLink(editingKeyLink.value)) {
        errorMessage.value = "You do not have permission to edit this key link."
        saving.value = false
        return
      }

      // Update existing key link
      const { error } = await client
        .from("key-links")
        .update(keyLinkData)
        .eq("id", editingKeyLink.value.id)

      if (error) throw error

      successMessage.value = "Key link updated successfully!"
    } else {
      // Create new key link
      const { error } = await client.from("key-links").insert([keyLinkData])

      if (error) throw error

      successMessage.value = "Key link created successfully!"
    }

    dialogVisible.value = false
    await fetchKeyLinks()
  } catch (error) {
    console.error("Error saving key link:", error)
    errorMessage.value = error.message || "Failed to save key link. Please try again."
  } finally {
    saving.value = false
  }
}

// Confirm delete
const confirmDelete = (keyLink) => {
  // Check if user has permission to delete this key link
  if (!canEditKeyLink(keyLink)) {
    errorMessage.value = "You do not have permission to delete this key link."
    return
  }

  keyLinkToDelete.value = keyLink
  deleteDialogVisible.value = true
  successMessage.value = ""
  errorMessage.value = ""
}

// Delete key link
const deleteKeyLink = async () => {
  deleting.value = true
  errorMessage.value = ""

  try {
    const { error } = await client
      .from("key-links")
      .delete()
      .eq("id", keyLinkToDelete.value.id)

    if (error) throw error

    successMessage.value = "Key link deleted successfully!"
    deleteDialogVisible.value = false
    await fetchKeyLinks()
  } catch (error) {
    console.error("Error deleting key link:", error)
    errorMessage.value = error.message || "Failed to delete key link. Please try again."
  } finally {
    deleting.value = false
  }
}

// Load data on mount
onMounted(async () => {
  await fetchRaces()
  await fetchCandidates()
  await fetchKeyLinks()
})

// Watch for prop changes (when navigating from filtered to unfiltered view)
watch(
  () => [props.raceId, props.candidateId],
  async () => {
    await fetchKeyLinks()
  }
)
</script>

<style scoped>
label.required::after {
  content: " *";
  color: var(--red);
}
</style>
