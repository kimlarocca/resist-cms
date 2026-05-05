<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <p>
        Group Links appear on the Team Only Site. Use them to share important resources
        like group chats, document libraries, meeting notes, or other external resources
        your team needs quick access to.
      </p>
      <Button
        label="Add Link"
        icon="pi pi-plus"
        style="width: 250px"
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

    <div v-else-if="links.length === 0">
      <p class="text-sm text-gray-500">No links yet. Add one to get started.</p>
    </div>

    <DataTable
      v-else
      :value="links"
      tableStyle="min-width: 30rem"
      @rowReorder="onRowReorder"
    >
      <template #empty>No links found.</template>

      <Column rowReorder style="width: 3rem" />

      <Column field="sort_order" header="#" style="width: 4rem">
        <template #body="{ data }">
          {{ data.sort_order }}
        </template>
      </Column>

      <Column field="title" header="Title" style="min-width: 12rem">
        <template #body="{ data }">
          <strong>{{ data.title }}</strong>
        </template>
      </Column>

      <Column field="url" header="URL" style="min-width: 14rem">
        <template #body="{ data }">
          <a
            :href="data.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 hover:underline break-all"
          >
            {{ data.url }}
          </a>
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
      :header="editingLink ? 'Edit Link' : 'Add Link'"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="flex flex-col gap-6 pt-4">
        <FloatLabel variant="on">
          <InputText id="link-title" v-model="form.title" class="w-full" />
          <label for="link-title">Title</label>
        </FloatLabel>

        <FloatLabel variant="on">
          <InputText
            id="link-url"
            v-model="form.url"
            type="url"
            class="w-full"
            :class="{ 'p-invalid': urlError }"
            @blur="validateUrl"
          />
          <label for="link-url">URL</label>
        </FloatLabel>
        <small v-if="urlError" class="text-red-500 -mt-4">{{ urlError }}</small>

        <div>
          <label class="block text-sm font-medium mb-2"
            >Description <span class="text-gray-400 font-normal">(optional)</span></label
          >
          <SimpleEditor id="link-description" v-model="form.description" height="120px" />
        </div>

        <FloatLabel variant="on">
          <InputNumber
            id="link-sort-order"
            v-model="form.sort_order"
            class="w-full"
            :min="0"
          />
          <label for="link-sort-order">Sort Order</label>
        </FloatLabel>
      </div>

      <template #footer>
        <Button label="Cancel" severity="secondary" @click="closeDialog" />
        <Button
          :label="editingLink ? 'Save Changes' : 'Add Link'"
          icon="pi pi-check"
          @click="saveLink"
          :loading="saving"
          :disabled="!form.title.trim() || !form.url.trim() || !!urlError"
        />
      </template>
    </Dialog>

    <!-- Delete Confirm Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="Delete Link"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex items-center gap-3">
        <i class="pi pi-exclamation-triangle text-red-500" style="font-size: 2rem" />
        <span>
          Are you sure you want to delete
          <strong>{{ linkToDelete?.title }}</strong
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
          @click="deleteLink"
          :loading="deleting"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  websiteId: {
    type: [String, Number],
    required: true,
  },
})

const supabase = useSupabaseClient()

const links = ref([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref("")
const successMessage = ref("")
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingLink = ref(null)
const linkToDelete = ref(null)
const urlError = ref("")

const emptyForm = () => ({ title: "", url: "", description: "", sort_order: 0 })
const form = ref(emptyForm())

const validateUrl = () => {
  urlError.value = ""
  if (!form.value.url.trim()) return
  try {
    const parsed = new URL(form.value.url)
    if (!parsed.protocol.startsWith("http")) {
      urlError.value = "URL must start with http:// or https://"
    }
  } catch {
    urlError.value = "Please enter a valid URL"
  }
}

const fetchLinks = async () => {
  loading.value = true
  errorMessage.value = ""

  const { data, error } = await supabase
    .from("group_links")
    .select("*")
    .eq("website_id", props.websiteId)
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching group links:", error)
    errorMessage.value = "Failed to load links."
  } else {
    links.value = data || []
  }

  loading.value = false
}

const openCreateDialog = () => {
  editingLink.value = null
  form.value = emptyForm()
  urlError.value = ""
  dialogVisible.value = true
}

const openEditDialog = (link) => {
  editingLink.value = link
  form.value = {
    title: link.title,
    url: link.url,
    description: link.description || "",
    sort_order: link.sort_order,
  }
  urlError.value = ""
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
}

const saveLink = async () => {
  validateUrl()
  if (urlError.value || !form.value.title.trim() || !form.value.url.trim()) return

  saving.value = true
  errorMessage.value = ""

  try {
    if (editingLink.value) {
      const { error } = await supabase
        .from("group_links")
        .update({
          title: form.value.title,
          url: form.value.url,
          description: form.value.description,
          sort_order: form.value.sort_order,
        })
        .eq("id", editingLink.value.id)

      if (error) throw error
    } else {
      const { error } = await supabase.from("group_links").insert({
        website_id: props.websiteId,
        title: form.value.title,
        url: form.value.url,
        description: form.value.description,
        sort_order: form.value.sort_order,
      })

      if (error) throw error
    }

    dialogVisible.value = false
    successMessage.value = editingLink.value ? "Link updated." : "Link added."
    setTimeout(() => (successMessage.value = ""), 3000)
    await fetchLinks()
  } catch (error) {
    console.error("Error saving link:", error)
    errorMessage.value = error.message || "Failed to save link."
  } finally {
    saving.value = false
  }
}

const confirmDelete = (link) => {
  linkToDelete.value = link
  deleteDialogVisible.value = true
}

const deleteLink = async () => {
  if (!linkToDelete.value) return

  deleting.value = true
  errorMessage.value = ""

  try {
    const { error } = await supabase
      .from("group_links")
      .delete()
      .eq("id", linkToDelete.value.id)

    if (error) throw error

    deleteDialogVisible.value = false
    successMessage.value = "Link deleted."
    setTimeout(() => (successMessage.value = ""), 3000)
    await fetchLinks()
  } catch (error) {
    console.error("Error deleting link:", error)
    errorMessage.value = error.message || "Failed to delete link."
  } finally {
    deleting.value = false
    linkToDelete.value = null
  }
}

const onRowReorder = async (event) => {
  links.value = event.value

  const updates = links.value.map((l, index) => ({
    ...l,
    sort_order: index + 1,
  }))
  links.value = updates

  try {
    for (const l of updates) {
      const { error } = await supabase
        .from("group_links")
        .update({ sort_order: l.sort_order })
        .eq("id", l.id)
      if (error) throw error
    }
  } catch (error) {
    console.error("Error saving reorder:", error)
    errorMessage.value = "Failed to save new order."
    await fetchLinks()
  }
}

onMounted(() => {
  fetchLinks()
})
</script>
