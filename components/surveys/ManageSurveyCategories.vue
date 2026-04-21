<template>
  <div class="manage-survey-categories">
    <div class="mb-4 flex justify-between items-center">
      <Button label="Create New Category" icon="pi pi-plus" @click="openCreateDialog" />
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
      :value="categories"
      :filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['name', 'title', 'slug']"
      sortMode="multiple"
      tableStyle="min-width: 40rem"
      @rowReorder="onRowReorder"
    >
      <template #header>
        <div class="flex justify-between">
          <InputText
            v-model="filters['global'].value"
            placeholder="Filter categories..."
            class="w-full max-w-xs"
          />
        </div>
      </template>

      <template #empty> No categories found. </template>

      <Column rowReorder style="width: 3rem" />
      <Column field="sort_order" header="Order" sortable style="width: 6rem">
        <template #body="{ data }">
          {{ data.sort_order }}
        </template>
      </Column>

      <Column field="name" header="Name" sortable style="min-width: 12rem">
        <template #body="{ data }">
          <strong>{{ data.name }}</strong>
        </template>
      </Column>

      <Column field="title" header="Title" sortable style="min-width: 15rem">
        <template #body="{ data }">
          {{ data.title }}
        </template>
      </Column>

      <Column field="slug" header="Slug" sortable style="min-width: 12rem">
        <template #body="{ data }">
          <code>{{ data.slug }}</code>
        </template>
      </Column>

      <Column style="width: 10rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              severity="secondary"
              v-tooltip.top="'Edit Category'"
              @click="openEditDialog(data)"
              text
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              v-tooltip.top="'Delete Category'"
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
      :header="editingCategory ? 'Edit Category' : 'Create New Category'"
      :modal="true"
      :style="{ width: '40vw' }"
    >
      <div class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium mb-2">Name *</label>
          <InputText
            id="name"
            v-model="formData.name"
            class="w-full"
            placeholder="Enter category name"
          />
        </div>

        <div>
          <label for="title" class="block text-sm font-medium mb-2">Title *</label>
          <InputText
            id="title"
            v-model="formData.title"
            class="w-full"
            placeholder="Enter category title"
          />
        </div>

        <div>
          <label for="slug" class="block text-sm font-medium mb-2">Slug *</label>
          <InputText
            id="slug"
            v-model="formData.slug"
            class="w-full"
            placeholder="enter-slug-here"
          />
        </div>

        <div>
          <label for="sort_order" class="block text-sm font-medium mb-2"
            >Sort Order *</label
          >
          <InputNumber
            id="sort_order"
            v-model="formData.sort_order"
            class="w-full"
            :min="0"
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" @click="dialogVisible = false" text />
        <Button
          :label="editingCategory ? 'Update' : 'Create'"
          @click="saveCategory"
          :loading="saving"
          :disabled="!formData.name || !formData.title || !formData.slug"
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
        Are you sure you want to delete the category
        <strong>{{ categoryToDelete?.name }}</strong
        >? This action cannot be undone.
      </p>
      <template #footer>
        <Button label="Cancel" @click="deleteDialogVisible = false" text />
        <Button
          label="Delete"
          severity="danger"
          @click="deleteCategory"
          :loading="deleting"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { FilterMatchMode } from "@primevue/core/api"

const client = useSupabaseClient()

const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingCategory = ref(null)
const categoryToDelete = ref(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const formData = ref({
  name: "",
  title: "",
  slug: "",
  sort_order: 0,
})

const fetchCategories = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    const { data, error } = await client
      .from("survey-categories")
      .select("*")
      .order("sort_order")

    if (error) throw error
    categories.value = data || []
  } catch (error) {
    console.error("Error fetching survey categories:", error)
    errorMessage.value = "Failed to load categories. Please try again."
  } finally {
    loading.value = false
  }
}

const openCreateDialog = () => {
  editingCategory.value = null
  formData.value = { name: "", title: "", slug: "", sort_order: 0 }
  dialogVisible.value = true
}

const openEditDialog = (category) => {
  editingCategory.value = category
  formData.value = {
    name: category.name,
    title: category.title,
    slug: category.slug,
    sort_order: category.sort_order,
  }
  dialogVisible.value = true
}

const saveCategory = async () => {
  if (!formData.value.name || !formData.value.title || !formData.value.slug) {
    errorMessage.value = "Name, title, and slug are required."
    return
  }

  saving.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    const categoryData = {
      name: formData.value.name,
      title: formData.value.title,
      slug: formData.value.slug,
      sort_order: formData.value.sort_order ?? 0,
    }

    if (editingCategory.value) {
      const { error } = await client
        .from("survey-categories")
        .update(categoryData)
        .eq("id", editingCategory.value.id)

      if (error) throw error
      successMessage.value = "Category updated successfully!"
    } else {
      const { error } = await client.from("survey-categories").insert([categoryData])

      if (error) throw error
      successMessage.value = "Category created successfully!"
    }

    dialogVisible.value = false
    await fetchCategories()

    setTimeout(() => {
      successMessage.value = ""
    }, 3000)
  } catch (error) {
    console.error("Error saving category:", error)
    errorMessage.value = `Failed to save category: ${error.message}`
  } finally {
    saving.value = false
  }
}

const confirmDelete = (category) => {
  categoryToDelete.value = category
  deleteDialogVisible.value = true
}

const deleteCategory = async () => {
  if (!categoryToDelete.value) return

  deleting.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    const { error } = await client
      .from("survey-categories")
      .delete()
      .eq("id", categoryToDelete.value.id)

    if (error) throw error

    successMessage.value = "Category deleted successfully!"
    deleteDialogVisible.value = false
    await fetchCategories()

    setTimeout(() => {
      successMessage.value = ""
    }, 3000)
  } catch (error) {
    console.error("Error deleting category:", error)
    errorMessage.value = `Failed to delete category: ${error.message}`
  } finally {
    deleting.value = false
  }
}

const onRowReorder = async (event) => {
  categories.value = event.value

  const updates = categories.value.map((c, index) => ({
    ...c,
    sort_order: index + 1,
  }))
  categories.value = updates

  try {
    for (const c of updates) {
      const { error } = await client
        .from("survey-categories")
        .update({ sort_order: c.sort_order })
        .eq("id", c.id)
      if (error) throw error
    }
  } catch (error) {
    console.error("Error saving reorder:", error)
    errorMessage.value = "Failed to save new order."
    await fetchCategories()
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<style lang="scss" scoped>
.manage-survey-categories {
  :deep(.p-datatable) {
    .p-datatable-header {
      background: transparent;
      border: none;
      padding: 1rem 0;
    }
  }
}
</style>
