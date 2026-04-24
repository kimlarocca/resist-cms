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
const emailSearch = ref("")

const filteredSubmissions = computed(() => {
  if (!emailSearch.value.trim()) return submissions.value
  const q = emailSearch.value.trim().toLowerCase()
  return submissions.value.filter((s) => s.email?.toLowerCase().includes(q))
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
    submissions.value = data
  }

  loading.value = false
}

const viewSubmission = (submission) => {
  selectedSubmission.value = submission
  dialogVisible.value = true
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString()
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

onMounted(() => {
  fetchSubmissions()
})
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Form Submissions</Title>
      </Head>
    </Html>
    <h1>Manage Form Submissions</h1>
    <Divider class="my-7" />

    <Message v-if="errorMessage" severity="error" class="mb-4">{{
      errorMessage
    }}</Message>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <ProgressSpinner />
    </div>

    <div v-else>
      <p v-if="submissions.length === 0">You have not had any form submissions yet.</p>
      <template v-else>
        <InputText v-model="emailSearch" placeholder="Filter by email..." class="mb-6" />
        <DataTable
          :value="filteredSubmissions"
          :paginator="submissions.length > 25"
          :rows="25"
          :rowsPerPageOptions="[25, 50, 100]"
          stripedRows
          class="p-datatable-sm"
          emptyMessage="No submissions yet."
        >
          <Column field="id" header="ID" sortable style="width: 5rem" />
          <Column field="email" header="Email" sortable style="min-width: 14rem" />
          <Column header="Name" style="min-width: 12rem">
            <template #body="{ data }">
              {{
                [data.form_data?.["First Name"], data.form_data?.["Last Name"]]
                  .filter(Boolean)
                  .join(" ") || "—"
              }}
            </template>
          </Column>
          <Column field="created_at" header="Submitted" sortable style="min-width: 12rem">
            <template #body="{ data }">
              {{ formatDate(data.created_at) }}
            </template>
          </Column>
          <Column header="" style="width: 7rem">
            <template #body="{ data }">
              <Button
                label="View"
                icon="pi pi-eye"
                size="small"
                severity="secondary"
                @click="viewSubmission(data)"
              />
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
        <div class="mb-4 text-sm text-gray-500">
          Submitted: {{ formatDate(selectedSubmission.created_at) }}
        </div>
        <DataTable :value="formDataEntries" class="p-datatable-sm" stripedRows>
          <Column field="key" header="Question" style="width: 40%; font-weight: 600" />
          <Column
            field="value"
            header="Answer"
            style="width: 60%; word-break: break-word"
          />
        </DataTable>
      </div>
    </Dialog>
  </div>
</template>
