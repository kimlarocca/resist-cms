<script setup>
definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const supabase = useSupabaseClient()
const websiteId = computed(() => route.params.id)

const submissions = ref([])
const loading = ref(true)
const errorMessage = ref("")
const selectedSubmission = ref(null)
const dialogVisible = ref(false)
const submissionToDelete = ref(null)
const deleteDialogVisible = ref(false)
const deleting = ref(false)
const search = ref("")
const statusFilter = ref(null)

const statusSortOrder = { pending: 0, active: 1, denied: 2 }

const filteredSubmissions = computed(() => {
  return submissions.value
    .filter((s) => {
      const q = search.value.trim().toLowerCase()
      const firstName = s.form_data?.["First Name"]?.toLowerCase() || ""
      const lastName = s.form_data?.["Last Name"]?.toLowerCase() || ""
      const matchesEmail =
        !q ||
        s.email?.toLowerCase().includes(q) ||
        firstName.includes(q) ||
        lastName.includes(q) ||
        `${firstName} ${lastName}`.includes(q)
      const matchesStatus =
        !statusFilter.value || (s.status || "pending") === statusFilter.value
      return matchesEmail && matchesStatus
    })
    .sort((a, b) => {
      const statusDiff =
        (statusSortOrder[a.status || "pending"] ?? 0) -
        (statusSortOrder[b.status || "pending"] ?? 0)
      if (statusDiff !== 0) return statusDiff
      return (a.email || "").localeCompare(b.email || "")
    })
})

const fetchSubmissions = async () => {
  loading.value = true
  errorMessage.value = ""

  const { data, error } = await supabase
    .from("visibility-brigade-submissions")
    .select("*")
    .eq("website_id", websiteId.value)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching submissions:", error)
    errorMessage.value = "Failed to load submissions."
  } else {
    submissions.value = data.map((s) => ({
      ...s,
      full_name:
        [s.form_data?.["First Name"], s.form_data?.["Last Name"]]
          .filter(Boolean)
          .join(" ") || "",
    }))
  }

  loading.value = false
}

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Denied", value: "denied" },
]

const statusCounts = computed(() => {
  const counts = { all: submissions.value.length, pending: 0, active: 0, denied: 0 }
  for (const s of submissions.value) {
    const status = s.status || "pending"
    if (status in counts) counts[status]++
  }
  return counts
})

const statusSeverity = (status) => {
  if (status === "active") return "success"
  if (status === "denied") return "danger"
  return "warn"
}

const updateStatus = async (submissionId, status) => {
  const { error } = await supabase
    .from("visibility-brigade-submissions")
    .update({ status })
    .eq("id", submissionId)

  if (error) {
    console.error("Error updating status:", error)
  } else {
    const match = submissions.value.find((s) => s.id === submissionId)
    if (match) match.status = status
  }
}

const viewSubmission = (submission) => {
  selectedSubmission.value = submission
  dialogVisible.value = true
}

const confirmDelete = (submission) => {
  submissionToDelete.value = submission
  deleteDialogVisible.value = true
}

const deleteSubmission = async () => {
  deleting.value = true
  const { error } = await supabase
    .from("visibility-brigade-submissions")
    .delete()
    .eq("id", submissionToDelete.value.id)

  if (error) {
    console.error("Error deleting submission:", error)
  } else {
    submissions.value = submissions.value.filter(
      (s) => s.id !== submissionToDelete.value.id
    )
    if (selectedSubmission.value?.id === submissionToDelete.value.id) {
      dialogVisible.value = false
      selectedSubmission.value = null
    }
    deleteDialogVisible.value = false
    submissionToDelete.value = null
  }
  deleting.value = false
}

const formDataEntries = computed(() => {
  if (!selectedSubmission.value?.form_data) return []
  return Object.entries(selectedSubmission.value.form_data).map(([key, value]) => ({
    key,
    value: Array.isArray(value)
      ? value.join(", ")
      : value === true
      ? "Yes"
      : value === false
      ? "No"
      : value || "—",
  }))
})

const clearFilters = () => {
  search.value = ""
  statusFilter.value = null
}

onMounted(() => {
  fetchSubmissions()
})

const { data: website } = await useAsyncData(`website-${websiteId.value}`, () =>
  getWebsiteData(websiteId.value)
)
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Signup Form Submissions</Title>
      </Head>
    </Html>
    <h1>Signup Form Submissions</h1>
    <Divider class="my-7" />
    <h2 v-if="website?.title" class="mb-12">{{ website?.title }}</h2>

    <Message v-if="errorMessage" severity="error" class="mb-4">{{
      errorMessage
    }}</Message>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <ProgressSpinner />
    </div>

    <div v-else>
      <p v-if="submissions.length === 0">
        You have not had any Signup form submissions yet.
      </p>
      <template v-else>
        <div class="flex flex-col md:flex-row md:items-center gap-3 mb-6">
          <IconField iconPosition="left" class="w-full">
            <InputIcon class="pi pi-search"> </InputIcon>
            <InputText
              v-model="search"
              placeholder="Filter members by name or email..."
            />
          </IconField>
          <div class="flex gap-2 shrink-0 flex-wrap">
            <Button
              :label="`All (${statusCounts.all})`"
              :severity="statusFilter === null ? 'primary' : 'secondary'"
              size="small"
              @click="statusFilter = null"
            />
            <Button
              :label="`Pending (${statusCounts.pending})`"
              :severity="statusFilter === 'pending' ? 'primary' : 'secondary'"
              size="small"
              @click="statusFilter = 'pending'"
            />
            <Button
              :label="`Active (${statusCounts.active})`"
              :severity="statusFilter === 'active' ? 'primary' : 'secondary'"
              size="small"
              @click="statusFilter = 'active'"
            />
            <Button
              :label="`Denied (${statusCounts.denied})`"
              :severity="statusFilter === 'denied' ? 'primary' : 'secondary'"
              size="small"
              @click="statusFilter = 'denied'"
            />
          </div>
          <Button
            v-if="search"
            label="Clear"
            severity="secondary"
            size="small"
            icon="pi pi-times"
            @click="clearFilters"
            class="px-4"
          />
        </div>
        <DataTable
          :value="filteredSubmissions"
          :paginator="submissions.length > 25"
          :rows="25"
          :rowsPerPageOptions="[25, 50, 100]"
          stripedRows
          class="p-datatable-sm"
          emptyMessage="No submissions yet."
        >
          <Column field="email" header="Email" sortable style="min-width: 14rem" />
          <Column field="full_name" header="Name" sortable style="min-width: 12rem">
            <template #body="{ data }">
              {{ data.full_name || "—" }}
            </template>
          </Column>
          <Column field="created_at" header="Submitted" sortable style="min-width: 12rem">
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
          </Column>
          <Column field="status" header="Status" sortable style="min-width: 10rem">
            <template #body="{ data }">
              <Select
                :key="data.id"
                :model-value="data.status || 'pending'"
                :options="statusOptions"
                option-label="label"
                option-value="value"
                @update:model-value="updateStatus(data.id, $event)"
                class="status-select"
                :pt="{
                  root: { class: 'border-0 shadow-none p-0 bg-transparent' },
                  label: { class: 'p-0' },
                  dropdown: { class: 'hidden' },
                }"
              >
                <template #value="{ value }">
                  <Tag
                    :value="value"
                    :severity="statusSeverity(value)"
                    class="capitalize cursor-pointer"
                  />
                </template>
              </Select>
            </template>
          </Column>
          <Column header="" style="width: 9rem">
            <template #body="{ data }">
              <div class="flex gap-2">
                <Button
                  label="View"
                  icon="pi pi-eye"
                  size="small"
                  @click="viewSubmission(data)"
                />
                <Button
                  icon="pi pi-trash"
                  size="small"
                  severity="danger"
                  @click="confirmDelete(data)"
                  v-tooltip.top="'Delete'"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </div>

    <!-- Submission Detail Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      modal
      header="Form Submission"
      :style="{ width: '80rem', maxWidth: '95vw' }"
      :closable="true"
    >
      <div v-if="selectedSubmission">
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm text-gray-500">
            Submitted: {{ formatDate(selectedSubmission.created_at) }}
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium">Status:</span>
            <Select
              :model-value="selectedSubmission.status || 'pending'"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              @update:model-value="updateStatus(selectedSubmission?.id, $event)"
              class="w-36"
            />
          </div>
        </div>
        <DataTable :value="formDataEntries" class="p-datatable-sm" stripedRows>
          <Column field="key" header="Question" style="width: 40%; font-weight: 600" />
          <Column
            field="value"
            header="Answer"
            style="width: 60%; word-break: break-word"
          />
        </DataTable>
        <div class="flex justify-end mt-6">
          <Button
            label="Delete Submission"
            icon="pi pi-trash"
            severity="danger"
            @click="confirmDelete(selectedSubmission)"
          />
        </div>
      </div>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      modal
      header="Confirm Delete"
      :style="{ width: '28rem' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span>
          Are you sure you want to delete the submission from
          <strong>{{ submissionToDelete?.email }}</strong
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
          :loading="deleting"
          @click="deleteSubmission"
        />
      </template>
    </Dialog>
  </div>
</template>
