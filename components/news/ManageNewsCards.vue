<template>
  <div class="manage-news-cards">
    <Message v-if="errorMessage" severity="error" class="mb-4" @close="errorMessage = ''">
      {{ errorMessage }}
    </Message>

    <Message v-if="successMessage" severity="success" class="mb-4" :closable="false">
      {{ successMessage }}
    </Message>

    <div class="grid grid-cols-2 items-center gap-4 mb-6">
      <InputText v-model="filters.global.value" placeholder="Search news cards..." />
      <div class="text-right">
        <Button label="Add News Card" icon="pi pi-plus" @click="openCreateDialog" />
      </div>
    </div>

    <ProgressSpinner v-if="loading" class="my-8" />

    <DataTable
      v-else
      :value="newsCards"
      stripedRows
      paginator
      :rows="25"
      :rowsPerPageOptions="[10, 25, 50]"
      v-model:filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['title', 'description', 'url']"
      class="p-datatable-sm"
    >
      <Column header="Image" style="width: 6rem">
        <template #body="{ data }">
          <img
            v-if="data.image_url"
            :src="data.image_url"
            alt=""
            class="w-16 h-10 object-cover rounded"
          />
          <span v-else class="text-gray-400 text-xs">No image</span>
        </template>
      </Column>
      <Column field="title" header="Title" sortable style="min-width: 14rem">
        <template #body="{ data }">
          <strong>{{ data.title || '(no title)' }}</strong>
        </template>
      </Column>
      <Column field="url" header="URL" sortable style="min-width: 14rem">
        <template #body="{ data }">
          <a :href="data.url" target="_blank" rel="noopener" class="text-blue-600 hover:underline text-sm">
            {{ truncateUrl(data.url) }}
          </a>
        </template>
      </Column>
      <Column header="Domains" style="min-width: 10rem">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <Tag
              v-for="d in data.domains"
              :key="d.id"
              :value="d.domain"
              severity="info"
              class="text-xs"
            />
            <span v-if="!data.domains?.length" class="text-gray-400 text-xs">None</span>
          </div>
        </template>
      </Column>
      <Column header="Date" style="width: 10rem" sortable field="created_at">
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

      <template #empty>
        <div class="text-center py-8">No news cards found. Click "Add News Card" to create one.</div>
      </template>
    </DataTable>

    <!-- Create / Edit Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editingCard ? 'Edit News Card' : 'Add News Card'"
      :modal="true"
      :style="{ width: '700px' }"
      :breakpoints="{ '960px': '85vw', '640px': '95vw' }"
    >
      <div class="flex flex-col gap-5 pt-4">
        <!-- URL input + fetch -->
        <div class="flex flex-col gap-2">
          <label for="nc-url" class="font-semibold required">URL</label>
          <div class="flex gap-2">
            <InputText
              id="nc-url"
              v-model="form.url"
              placeholder="https://..."
              class="flex-1"
            />
            <Button
              label="Fetch"
              icon="pi pi-download"
              @click="fetchOpenGraph"
              :loading="fetchingOg"
              :disabled="!form.url.trim()"
            />
          </div>
          <small class="text-gray-500">Enter a URL and click Fetch to auto-fill title, description, and image from Open Graph tags.</small>
        </div>

        <!-- OG preview -->
        <Message v-if="ogFetched" severity="info" :closable="false" class="text-sm">
          Open Graph data loaded. You can override any field below.
        </Message>

        <!-- Title -->
        <div class="flex flex-col gap-2">
          <label for="nc-title" class="font-semibold">Title</label>
          <InputText id="nc-title" v-model="form.title" placeholder="Title" class="w-full" />
          <small v-if="form.og_title && form.title !== form.og_title" class="text-gray-400">
            OG title: {{ form.og_title }}
          </small>
        </div>

        <!-- Description -->
        <div class="flex flex-col gap-2">
          <label for="nc-description" class="font-semibold">Description</label>
          <Textarea id="nc-description" v-model="form.description" rows="3" placeholder="Description" class="w-full" />
          <small v-if="form.og_description && form.description !== form.og_description" class="text-gray-400">
            OG description: {{ form.og_description }}
          </small>
        </div>

        <!-- Image -->
        <div class="flex flex-col gap-2">
          <label class="font-semibold">Image</label>

          <div v-if="form.image_url" class="mb-2">
            <img :src="form.image_url" alt="News card image" class="max-h-48 rounded border border-surface-200 object-contain" />
          </div>

          <TabView>
            <TabPanel header="Image URL">
              <div class="flex flex-col gap-2 pt-2">
                <InputText v-model="form.image_url" placeholder="https://..." class="w-full" />
                <small v-if="form.og_image_url && form.image_url !== form.og_image_url" class="text-gray-400">
                  OG image: {{ form.og_image_url }}
                </small>
              </div>
            </TabPanel>
            <TabPanel header="Upload Image">
              <div class="pt-2">
                <SupabaseImageUploader
                  bucket="news-cards"
                  v-model="form.image_url"
                  :website-id="'news-cards'"
                />
              </div>
            </TabPanel>
          </TabView>
        </div>

        <!-- Domain selection -->
        <div class="flex flex-col gap-2">
          <label class="font-semibold">Sites</label>
          <small class="text-gray-500">Select which sites this news card should appear on.</small>

          <div class="flex items-center gap-2 mb-2">
            <Checkbox
              v-model="selectAllDomains"
              :binary="true"
              inputId="select-all-domains"
              @change="toggleSelectAll"
            />
            <label for="select-all-domains">Select All</label>
          </div>

          <div class="flex flex-wrap gap-3 max-h-48 overflow-y-auto p-2 border border-surface-200 rounded">
            <div v-for="domain in domains" :key="domain.id" class="flex items-center gap-2">
              <Checkbox
                v-model="form.selectedDomainIds"
                :inputId="'domain-' + domain.id"
                :value="domain.id"
                @change="updateSelectAll"
              />
              <label :for="'domain-' + domain.id" class="text-sm">{{ domain.domain }}</label>
            </div>
            <div v-if="domains.length === 0" class="text-gray-400 text-sm py-2">
              No domains yet. Add one below.
            </div>
          </div>

          <!-- Add / Delete domains inline -->
          <div class="flex gap-2 mt-2">
            <InputText v-model="newDomain" placeholder="Add domain (e.g. example.com)" class="flex-1" />
            <Button label="Add" icon="pi pi-plus" size="small" @click="addDomain" :disabled="!newDomain.trim()" :loading="addingDomain" />
          </div>

          <!-- Domain chips with delete -->
          <div v-if="domains.length > 0" class="mt-2">
            <Accordion>
              <AccordionPanel value="manage">
                <AccordionHeader>Manage Domains</AccordionHeader>
                <AccordionContent>
                  <div class="flex flex-wrap gap-2 pt-2">
                    <Chip
                      v-for="domain in domains"
                      :key="domain.id"
                      :label="domain.domain"
                      removable
                      @remove="confirmDeleteDomain(domain)"
                    />
                  </div>
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" severity="secondary" @click="dialogVisible = false" />
        <Button
          :label="editingCard ? 'Save Changes' : 'Create'"
          icon="pi pi-check"
          @click="saveNewsCard"
          :loading="saving"
          :disabled="!form.url.trim()"
        />
      </template>
    </Dialog>

    <!-- Delete News Card Confirmation -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="Delete News Card"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span>
          Are you sure you want to delete
          <strong>{{ cardToDelete?.title || cardToDelete?.url }}</strong>?
          This cannot be undone.
        </span>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="deleteDialogVisible = false" />
        <Button label="Delete" severity="danger" @click="deleteNewsCard" :loading="deleting" />
      </template>
    </Dialog>

    <!-- Delete Domain Confirmation -->
    <Dialog
      v-model:visible="deleteDomainDialogVisible"
      header="Delete Domain"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span>
          Are you sure you want to delete <strong>{{ domainToDelete?.domain }}</strong>?
          It will be removed from all news cards.
        </span>
      </div>
      <template #footer>
        <Button label="Cancel" severity="secondary" @click="deleteDomainDialogVisible = false" />
        <Button label="Delete" severity="danger" @click="deleteDomain" :loading="deletingDomain" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { FilterMatchMode } from "@primevue/core/api"
import { useCurrentUserProfile } from "~/composables/states"

const supabase = useSupabaseClient()
const currentUserProfile = useCurrentUserProfile()

// Data
const newsCards = ref([])
const domains = ref([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const fetchingOg = ref(false)
const ogFetched = ref(false)
const addingDomain = ref(false)
const deletingDomain = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

// Dialogs
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const deleteDomainDialogVisible = ref(false)
const editingCard = ref(null)
const cardToDelete = ref(null)
const domainToDelete = ref(null)

// Domain add
const newDomain = ref("")
const selectAllDomains = ref(false)

// Filters
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const emptyForm = () => ({
  url: "",
  title: "",
  description: "",
  image_url: "",
  og_title: "",
  og_description: "",
  og_image_url: "",
  selectedDomainIds: [],
})

const form = ref(emptyForm())

const formatDate = (dateStr) => {
  if (!dateStr) return ""
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr))
}

const truncateUrl = (url) => {
  if (!url) return ""
  try {
    const u = new URL(url)
    const path = u.pathname.length > 30 ? u.pathname.substring(0, 30) + "…" : u.pathname
    return u.hostname + path
  } catch {
    return url.length > 50 ? url.substring(0, 50) + "…" : url
  }
}

// Fetch all news cards with their domain assignments
const fetchNewsCards = async () => {
  loading.value = true
  errorMessage.value = ""

  const { data, error } = await supabase
    .from("news_cards")
    .select("*, news_card_domain_assignments(domain_id, news_card_domains(id, domain))")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching news cards:", error)
    errorMessage.value = "Failed to load news cards."
    loading.value = false
    return
  }

  newsCards.value = (data || []).map((card) => ({
    ...card,
    domains: (card.news_card_domain_assignments || [])
      .map((a) => a.news_card_domains)
      .filter(Boolean),
  }))

  loading.value = false
}

// Fetch all domains
const fetchDomains = async () => {
  const { data, error } = await supabase
    .from("news_card_domains")
    .select("*")
    .order("domain", { ascending: true })

  if (error) {
    console.error("Error fetching domains:", error)
    return
  }

  domains.value = data || []
}

// Fetch Open Graph data from URL
const fetchOpenGraph = async () => {
  if (!form.value.url.trim()) return

  fetchingOg.value = true
  ogFetched.value = false
  errorMessage.value = ""

  try {
    const { data, error } = await useFetch("/api/fetch-og", {
      method: "POST",
      body: { url: form.value.url },
    })

    if (error.value) {
      throw new Error(error.value.data?.message || "Failed to fetch Open Graph data.")
    }

    const og = data.value
    if (og) {
      form.value.og_title = og.title || ""
      form.value.og_description = og.description || ""
      form.value.og_image_url = og.image || ""

      // Only auto-fill if the fields are empty
      if (!form.value.title) form.value.title = og.title || ""
      if (!form.value.description) form.value.description = og.description || ""
      if (!form.value.image_url) form.value.image_url = og.image || ""

      ogFetched.value = true
    }
  } catch (err) {
    console.error("Error fetching OG data:", err)
    errorMessage.value = err.message || "Failed to fetch Open Graph data."
  } finally {
    fetchingOg.value = false
  }
}

// Dialog handlers
const openCreateDialog = () => {
  editingCard.value = null
  form.value = emptyForm()
  ogFetched.value = false
  dialogVisible.value = true
  updateSelectAll()
}

const openEditDialog = (card) => {
  editingCard.value = card
  form.value = {
    url: card.url,
    title: card.title || "",
    description: card.description || "",
    image_url: card.image_url || "",
    og_title: card.og_title || "",
    og_description: card.og_description || "",
    og_image_url: card.og_image_url || "",
    selectedDomainIds: (card.domains || []).map((d) => d.id),
  }
  ogFetched.value = false
  dialogVisible.value = true
  updateSelectAll()
}

// Select all domains toggle
const toggleSelectAll = () => {
  if (selectAllDomains.value) {
    form.value.selectedDomainIds = domains.value.map((d) => d.id)
  } else {
    form.value.selectedDomainIds = []
  }
}

const updateSelectAll = () => {
  selectAllDomains.value =
    domains.value.length > 0 &&
    form.value.selectedDomainIds.length === domains.value.length
}

// Save news card
const saveNewsCard = async () => {
  if (!form.value.url.trim()) return

  saving.value = true
  errorMessage.value = ""

  try {
    const cardData = {
      url: form.value.url,
      title: form.value.title || null,
      description: form.value.description || null,
      image_url: form.value.image_url || null,
      og_title: form.value.og_title || null,
      og_description: form.value.og_description || null,
      og_image_url: form.value.og_image_url || null,
    }

    let cardId

    if (editingCard.value) {
      const { error } = await supabase
        .from("news_cards")
        .update(cardData)
        .eq("id", editingCard.value.id)

      if (error) throw error
      cardId = editingCard.value.id
    } else {
      cardData.created_by = currentUserProfile.value?.id ?? null
      const { data, error } = await supabase
        .from("news_cards")
        .insert(cardData)
        .select()
        .single()

      if (error) throw error
      cardId = data.id
    }

    // Sync domain assignments
    // Delete existing assignments for this card
    const { error: deleteError } = await supabase
      .from("news_card_domain_assignments")
      .delete()
      .eq("news_card_id", cardId)

    if (deleteError) throw deleteError

    // Insert new assignments
    if (form.value.selectedDomainIds.length > 0) {
      const assignments = form.value.selectedDomainIds.map((domainId) => ({
        news_card_id: cardId,
        domain_id: domainId,
      }))

      const { error: insertError } = await supabase
        .from("news_card_domain_assignments")
        .insert(assignments)

      if (insertError) throw insertError
    }

    dialogVisible.value = false
    successMessage.value = editingCard.value ? "News card updated." : "News card created."
    setTimeout(() => (successMessage.value = ""), 3000)
    await fetchNewsCards()
  } catch (error) {
    console.error("Error saving news card:", error)
    errorMessage.value = error.message || "Failed to save news card."
  } finally {
    saving.value = false
  }
}

// Delete news card
const confirmDelete = (card) => {
  cardToDelete.value = card
  deleteDialogVisible.value = true
}

const deleteNewsCard = async () => {
  if (!cardToDelete.value) return

  deleting.value = true
  errorMessage.value = ""

  try {
    const { error } = await supabase
      .from("news_cards")
      .delete()
      .eq("id", cardToDelete.value.id)

    if (error) throw error

    deleteDialogVisible.value = false
    successMessage.value = "News card deleted."
    setTimeout(() => (successMessage.value = ""), 3000)
    await fetchNewsCards()
  } catch (error) {
    console.error("Error deleting news card:", error)
    errorMessage.value = error.message || "Failed to delete news card."
  } finally {
    deleting.value = false
    cardToDelete.value = null
  }
}

// Add domain
const addDomain = async () => {
  if (!newDomain.value.trim()) return

  addingDomain.value = true
  errorMessage.value = ""

  try {
    const { data, error } = await supabase
      .from("news_card_domains")
      .insert({ domain: newDomain.value.trim().toLowerCase() })
      .select()
      .single()

    if (error) throw error

    domains.value.push(data)
    domains.value.sort((a, b) => a.domain.localeCompare(b.domain))
    newDomain.value = ""
  } catch (error) {
    console.error("Error adding domain:", error)
    errorMessage.value = error.message || "Failed to add domain."
  } finally {
    addingDomain.value = false
  }
}

// Delete domain
const confirmDeleteDomain = (domain) => {
  domainToDelete.value = domain
  deleteDomainDialogVisible.value = true
}

const deleteDomain = async () => {
  if (!domainToDelete.value) return

  deletingDomain.value = true
  errorMessage.value = ""

  try {
    const { error } = await supabase
      .from("news_card_domains")
      .delete()
      .eq("id", domainToDelete.value.id)

    if (error) throw error

    domains.value = domains.value.filter((d) => d.id !== domainToDelete.value.id)
    // Also remove from selected if present
    form.value.selectedDomainIds = form.value.selectedDomainIds.filter(
      (id) => id !== domainToDelete.value.id
    )
    deleteDomainDialogVisible.value = false
    successMessage.value = "Domain deleted."
    setTimeout(() => (successMessage.value = ""), 3000)
    await fetchNewsCards()
  } catch (error) {
    console.error("Error deleting domain:", error)
    errorMessage.value = error.message || "Failed to delete domain."
  } finally {
    deletingDomain.value = false
    domainToDelete.value = null
  }
}

// Init
onMounted(async () => {
  await Promise.all([fetchNewsCards(), fetchDomains()])
})
</script>
