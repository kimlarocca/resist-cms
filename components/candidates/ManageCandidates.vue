<template>
  <div class="manage-candidates">
    <Message v-if="errorMessage" severity="error" class="mb-4">
      {{ errorMessage }}
    </Message>

    <Message v-if="successMessage" severity="success" class="mb-4">
      {{ successMessage }}
    </Message>

    <div class="grid grid-cols-2 item-center gap-4 mb-6">
      <InputText v-model="filters.global.value" placeholder="Search candidates..." />
      <div class="text-right">
        <Button
          class="w-fit"
          label="Add Candidate"
          icon="pi pi-plus"
          @click="openDialog()"
        />
      </div>
    </div>

    <DataTable
      :value="candidates"
      :loading="loading"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 25, 50]"
      stripedRows
      v-model:filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['name', 'party', 'race_slug', 'candidate_status']"
      class="p-datatable-sm"
    >
      <Column field="name" header="Candidate Name" sortable>
        <template #body="{ data }">
          {{ data.name }}
        </template>
      </Column>

      <Column field="party" header="Party" sortable />

      <Column field="candidate_status" header="Status" sortable>
        <template #body="{ data }">
          <Tag
            v-if="data.candidate_status"
            :severity="getStatusSeverity(data.candidate_status)"
            :value="data.candidate_status"
          />
          <span v-else>N/A</span>
        </template>
      </Column>

      <Column field="race_slug" header="Race" sortable>
        <template #body="{ data }">
          {{ data.race_slug || "N/A" }}
        </template>
      </Column>

      <Column style="width: 12rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <NuxtLink
              :to="`https://votebyvalues.com/${data.slug}`"
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

      <Column v-if="false" style="width: 12rem">
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
          No candidates found. Click "Add Candidate" to create one.
        </div>
      </template>
    </DataTable>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editingCandidate ? 'Edit Candidate' : 'Add New Candidate'"
      :modal="true"
      :style="{ width: '60vw' }"
      :breakpoints="{ '960px': '80vw', '640px': '95vw' }"
    >
      <form @submit.prevent="saveCandidate" class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="name" class="font-semibold required">Candidate Name</label>
            <InputText
              id="name"
              v-model="formData.name"
              required
              placeholder="Full name"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="party" class="font-semibold">Party</label>
            <Select
              id="party"
              v-model="formData.party"
              :options="partyOptions"
              placeholder="Select party"
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="race_slug" class="font-semibold required">Race</label>
            <Select
              id="race_slug"
              v-model="formData.race_slug"
              :options="availableRaces"
              optionLabel="name"
              optionValue="slug"
              placeholder="Select race"
              class="w-full"
              filter
              required
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="candidate_status" class="font-semibold">Status</label>
            <Select
              id="candidate_status"
              v-model="formData.candidate_status"
              :options="statusOptions"
              placeholder="Select status"
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="residence" class="font-semibold">Residence</label>
            <InputText
              id="residence"
              v-model="formData.residence"
              placeholder="City, State"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="slug" class="font-semibold">Slug</label>
            <InputText
              id="slug"
              v-model="formData.slug"
              placeholder="url-friendly-name"
            />
            <small class="text-gray-500">Auto-generated from name if left blank</small>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="micro_bio" class="font-semibold">Micro Bio</label>
          <SimpleEditor
            v-model="formData.micro_bio"
            placeholder="Brief one-liner"
            height="100px"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="bio" class="font-semibold">Bio</label>
          <SimpleEditor
            id="bio"
            v-model="formData.bio"
            rows="4"
            placeholder="Full biography"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="experience" class="font-semibold">Experience</label>
          <SimpleEditor
            id="experience"
            v-model="formData.experience"
            rows="3"
            placeholder="Professional experience"
          />
        </div>

        <Accordion>
          <AccordionTab header="Contact & Social Media">
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label for="website_url" class="font-semibold">Website URL</label>
                  <InputText
                    id="website_url"
                    v-model="formData.website_url"
                    placeholder="https://..."
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="announcement_url" class="font-semibold"
                    >Announcement URL</label
                  >
                  <InputText
                    id="announcement_url"
                    v-model="formData.announcement_url"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="flex flex-col gap-2">
                  <label for="twitter" class="font-semibold">Twitter/X</label>
                  <InputText
                    id="twitter"
                    v-model="formData.twitter"
                    placeholder="@username"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="bluesky" class="font-semibold">Bluesky</label>
                  <InputText
                    id="bluesky"
                    v-model="formData.bluesky"
                    placeholder="@username.bsky.social"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="facebook" class="font-semibold">Facebook</label>
                  <InputText
                    id="facebook"
                    v-model="formData.facebook"
                    placeholder="username"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="flex flex-col gap-2">
                  <label for="instagram" class="font-semibold">Instagram</label>
                  <InputText
                    id="instagram"
                    v-model="formData.instagram"
                    placeholder="@username"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="tiktok" class="font-semibold">TikTok</label>
                  <InputText
                    id="tiktok"
                    v-model="formData.tiktok"
                    placeholder="@username"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="youtube" class="font-semibold">YouTube</label>
                  <InputText
                    id="youtube"
                    v-model="formData.youtube"
                    placeholder="channel URL"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label for="threads" class="font-semibold">Threads</label>
                  <InputText
                    id="threads"
                    v-model="formData.threads"
                    placeholder="@username"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="substack" class="font-semibold">Substack</label>
                  <InputText
                    id="substack"
                    v-model="formData.substack"
                    placeholder="URL"
                  />
                </div>
              </div>
            </div>
          </AccordionTab>

          <AccordionTab header="Funding & PACs">
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label for="funding" class="font-semibold">Funding Info</label>
                  <SimpleEditor
                    id="funding"
                    v-model="formData.funding"
                    rows="3"
                    placeholder="Funding details"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="endorsements" class="font-semibold">Endorsements</label>
                  <SimpleEditor
                    id="endorsements"
                    v-model="formData.endorsements"
                    rows="3"
                    placeholder="Notable endorsements"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label for="corporate_pacs" class="font-semibold">Corporate PACs</label>
                  <Select
                    id="corporate_pacs"
                    v-model="formData.corporate_pacs"
                    :options="pacOptions"
                    placeholder="Select stance"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="any_pacs" class="font-semibold">Any PACs</label>
                  <Select
                    id="any_pacs"
                    v-model="formData.any_pacs"
                    :options="pacOptions"
                    placeholder="Select stance"
                    class="w-full"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="flex flex-col gap-2">
                  <label for="aipac" class="font-semibold">AIPAC</label>
                  <Select
                    id="aipac"
                    v-model="formData.aipac"
                    :options="pacOptions"
                    placeholder="Select stance"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="musk_pacs" class="font-semibold">Musk PACs</label>
                  <Select
                    id="musk_pacs"
                    v-model="formData.musk_pacs"
                    :options="pacOptions"
                    placeholder="Select stance"
                    class="w-full"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="bezos_pacs" class="font-semibold">Bezos PACs</label>
                  <Select
                    id="bezos_pacs"
                    v-model="formData.bezos_pacs"
                    :options="pacOptions"
                    placeholder="Select stance"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </AccordionTab>

          <AccordionTab header="Additional Info">
            <div class="flex flex-col gap-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label for="image" class="font-semibold">Image URL</label>
                  <InputText
                    id="image"
                    v-model="formData.image"
                    placeholder="https://..."
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="video_url" class="font-semibold">Video URL</label>
                  <InputText
                    id="video_url"
                    v-model="formData.video_url"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label for="ballotpedia" class="font-semibold">Ballotpedia</label>
                  <InputText
                    id="ballotpedia"
                    v-model="formData.ballotpedia"
                    placeholder="URL"
                  />
                </div>

                <div class="flex flex-col gap-2">
                  <label for="candidate_code" class="font-semibold">Candidate Code</label>
                  <InputText
                    id="candidate_code"
                    v-model="formData.candidate_code"
                    placeholder="Unique code"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <label for="special_interests" class="font-semibold"
                  >Special Interests</label
                >
                <SimpleEditor
                  id="special_interests"
                  v-model="formData.special_interests"
                  rows="3"
                  placeholder="Special interests information"
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
            :label="editingCandidate ? 'Update' : 'Create'"
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
          Are you sure you want to delete <strong>{{ candidateToDelete?.name }}</strong
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
          @click="deleteCandidate"
          :loading="deleting"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { FilterMatchMode } from "@primevue/core/api"

const props = defineProps({
  raceSlug: {
    type: String,
    default: null,
  },
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const userProfile = useCurrentUserProfile()

const candidates = ref([])
const availableRaces = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingCandidate = ref(null)
const candidateToDelete = ref(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const partyOptions = ["Democrat", "Republican", "Independent", "3rd Party"]
const statusOptions = ["Prospective", "Active", "Withdrawn", "Won", "Lost"]
const pacOptions = ["Accepts", "Rejects", "No Statement"]

const formData = ref({
  name: "",
  party: null,
  race_slug: null,
  residence: "",
  micro_bio: "",
  bio: "",
  experience: "",
  website_url: "",
  announcement_url: "",
  video_url: "",
  video_embed: "",
  image: "",
  slug: "",
  candidate_code: "",
  candidate_status: "Active",
  twitter: "",
  bluesky: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  youtube: "",
  threads: "",
  substack: "",
  ballotpedia: "",
  funding: "",
  endorsements: "",
  special_interests: "",
  corporate_pacs: "No Statement",
  aipac: "No Statement",
  any_pacs: "No Statement",
  musk_pacs: "No Statement",
  bezos_pacs: "No Statement",
})

// Check if user is super admin
const isSuperAdmin = computed(() => userProfile.value?.role === "super_admin")
const isRaceAdmin = computed(() => userProfile.value?.role === "race_admin")

// Check if user can edit a specific candidate (via race)
const canEditCandidate = (candidate) => {
  console.log("canEditCandidate check:", {
    isSuperAdmin: isSuperAdmin.value,
    isRaceAdmin: isRaceAdmin.value,
    userRole: userProfile.value?.role,
    candidateRaceSlug: candidate.race_slug,
  })

  if (isSuperAdmin.value) return true
  if (isRaceAdmin.value) {
    const race = availableRaces.value.find((r) => r.slug === candidate.race_slug)
    return race && race.admin_id === userProfile.value?.id
  }
  return false
}

// Get status severity for tags
const getStatusSeverity = (status) => {
  const severityMap = {
    Prospective: "info",
    Active: "success",
    Withdrawn: "warning",
    Won: "success",
    Lost: "danger",
  }
  return severityMap[status] || "secondary"
}

// Fetch available races
const fetchRaces = async () => {
  try {
    let query = client.from("races").select("*")

    // If user is race_admin, only fetch their races
    if (isRaceAdmin.value && !isSuperAdmin.value && userProfile.value?.id) {
      query = query.eq("admin_id", userProfile.value.id)
    }

    const { data, error } = await query

    if (error) throw error

    availableRaces.value = data || []
    // Clear error message on success
    errorMessage.value = ""
  } catch (error) {
    console.error("Error fetching races:", error)
    errorMessage.value = "Failed to load races."
  }
}

// Fetch all candidates
const fetchCandidates = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    // Wait for races to be loaded first
    if (availableRaces.value.length === 0) {
      await fetchRaces()
    }

    let query = client.from("candidates").select("*").order("name", { ascending: true })

    // Filter by specific race if raceSlug prop is provided
    if (props.raceSlug) {
      query = query.eq("race_slug", props.raceSlug)
    }
    // Otherwise, if user is race_admin, only fetch candidates for their races
    else if (isRaceAdmin.value && !isSuperAdmin.value) {
      const raceSlugs = availableRaces.value.map((r) => r.slug)
      if (raceSlugs.length > 0) {
        query = query.in("race_slug", raceSlugs)
      } else {
        // No races, so no candidates
        candidates.value = []
        loading.value = false
        return
      }
    }

    const { data, error } = await query

    if (error) throw error

    candidates.value = data || []
  } catch (error) {
    console.error("Error fetching candidates:", error)
    errorMessage.value = "Failed to load candidates. Please try again."
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
const openDialog = (candidate = null) => {
  if (candidate) {
    // Check if user has permission to edit this candidate
    if (!canEditCandidate(candidate)) {
      errorMessage.value = "You do not have permission to edit this candidate."
      return
    }

    editingCandidate.value = candidate
    formData.value = {
      name: candidate.name || "",
      party: candidate.party || null,
      race_slug: candidate.race_slug || null,
      residence: candidate.residence || "",
      micro_bio: candidate.micro_bio || "",
      bio: candidate.bio || "",
      experience: candidate.experience || "",
      website_url: candidate.website_url || "",
      announcement_url: candidate.announcement_url || "",
      video_url: candidate.video_url || "",
      video_embed: candidate.video_embed || "",
      image: candidate.image || "",
      slug: candidate.slug || "",
      candidate_code: candidate.candidate_code || "",
      candidate_status: candidate.candidate_status || "Active",
      twitter: candidate.twitter || "",
      bluesky: candidate.bluesky || "",
      facebook: candidate.facebook || "",
      instagram: candidate.instagram || "",
      tiktok: candidate.tiktok || "",
      youtube: candidate.youtube || "",
      threads: candidate.threads || "",
      substack: candidate.substack || "",
      ballotpedia: candidate.ballotpedia || "",
      funding: candidate.funding || "",
      endorsements: candidate.endorsements || "",
      special_interests: candidate.special_interests || "",
      corporate_pacs: candidate.corporate_pacs || "No Statement",
      aipac: candidate.aipac || "No Statement",
      any_pacs: candidate.any_pacs || "No Statement",
      musk_pacs: candidate.musk_pacs || "No Statement",
      bezos_pacs: candidate.bezos_pacs || "No Statement",
    }
  } else {
    editingCandidate.value = null
    formData.value = {
      name: "",
      party: null,
      race_slug: props.raceSlug || null,
      residence: "",
      micro_bio: "",
      bio: "",
      experience: "",
      website_url: "",
      announcement_url: "",
      video_url: "",
      video_embed: "",
      image: "",
      slug: "",
      candidate_code: "",
      candidate_status: "Active",
      twitter: "",
      bluesky: "",
      facebook: "",
      instagram: "",
      tiktok: "",
      youtube: "",
      threads: "",
      substack: "",
      ballotpedia: "",
      funding: "",
      endorsements: "",
      special_interests: "",
      corporate_pacs: "No Statement",
      aipac: "No Statement",
      any_pacs: "No Statement",
      musk_pacs: "No Statement",
      bezos_pacs: "No Statement",
    }
  }
  dialogVisible.value = true
  successMessage.value = ""
  errorMessage.value = ""
}

// Save candidate (create or update)
const saveCandidate = async () => {
  saving.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    // Auto-generate slug if not provided
    if (!formData.value.slug && formData.value.name) {
      formData.value.slug = generateSlug(formData.value.name)
    }

    const candidateData = {
      name: formData.value.name,
      party: formData.value.party || null,
      race_slug: formData.value.race_slug || null,
      residence: formData.value.residence || null,
      micro_bio: formData.value.micro_bio || null,
      bio: formData.value.bio || null,
      experience: formData.value.experience || null,
      website_url: formData.value.website_url || null,
      announcement_url: formData.value.announcement_url || null,
      video_url: formData.value.video_url || null,
      video_embed: formData.value.video_embed || null,
      image: formData.value.image || null,
      slug: formData.value.slug || null,
      candidate_code: formData.value.candidate_code || null,
      candidate_status: formData.value.candidate_status || "Active",
      twitter: formData.value.twitter || null,
      bluesky: formData.value.bluesky || null,
      facebook: formData.value.facebook || null,
      instagram: formData.value.instagram || null,
      tiktok: formData.value.tiktok || null,
      youtube: formData.value.youtube || null,
      threads: formData.value.threads || null,
      substack: formData.value.substack || null,
      ballotpedia: formData.value.ballotpedia || null,
      funding: formData.value.funding || null,
      endorsements: formData.value.endorsements || null,
      special_interests: formData.value.special_interests || null,
      corporate_pacs: formData.value.corporate_pacs || "No Statement",
      aipac: formData.value.aipac || "No Statement",
      any_pacs: formData.value.any_pacs || "No Statement",
      musk_pacs: formData.value.musk_pacs || "No Statement",
      bezos_pacs: formData.value.bezos_pacs || "No Statement",
    }

    if (editingCandidate.value) {
      // Check permission before updating
      if (!canEditCandidate(editingCandidate.value)) {
        errorMessage.value = "You do not have permission to edit this candidate."
        saving.value = false
        return
      }

      // Update existing candidate
      const { error } = await client
        .from("candidates")
        .update(candidateData)
        .eq("id", editingCandidate.value.id)

      if (error) throw error

      successMessage.value = "Candidate updated successfully!"
    } else {
      // Create new candidate
      const { error } = await client.from("candidates").insert([candidateData])

      if (error) throw error

      successMessage.value = "Candidate created successfully!"
    }

    dialogVisible.value = false
    await fetchCandidates()
  } catch (error) {
    console.error("Error saving candidate:", error)
    errorMessage.value = error.message || "Failed to save candidate. Please try again."
  } finally {
    saving.value = false
  }
}

// Confirm delete
const confirmDelete = (candidate) => {
  // Check if user has permission to delete this candidate
  if (!canEditCandidate(candidate)) {
    errorMessage.value = "You do not have permission to delete this candidate."
    return
  }

  candidateToDelete.value = candidate
  deleteDialogVisible.value = true
  successMessage.value = ""
  errorMessage.value = ""
}

// Delete candidate
const deleteCandidate = async () => {
  deleting.value = true
  errorMessage.value = ""

  try {
    const { error } = await client
      .from("candidates")
      .delete()
      .eq("id", candidateToDelete.value.id)

    if (error) throw error

    successMessage.value = "Candidate deleted successfully!"
    deleteDialogVisible.value = false
    await fetchCandidates()
  } catch (error) {
    console.error("Error deleting candidate:", error)
    errorMessage.value = error.message || "Failed to delete candidate. Please try again."
  } finally {
    deleting.value = false
  }
}

// Load data on mount
onMounted(async () => {
  await fetchRaces()
  await fetchCandidates()
})
</script>

<style scoped>
label.required::after {
  content: " *";
  color: var(--red);
}
</style>
