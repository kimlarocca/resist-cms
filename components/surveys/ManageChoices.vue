<template>
  <div class="manage-choices">
    <div class="mb-6">
      <Button
        label="Back to Questions"
        icon="pi pi-arrow-left"
        text
        @click="navigateTo(`/surveys/${surveyId}/questions`)"
        class="mb-4"
      />
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold mb-2">{{ question?.title }}</h2>
          <div class="flex gap-2 items-center">
            <Tag :value="question?.question_type" severity="info" />
            <span class="text-gray-600">{{ getCategoryName(question?.category_id) }}</span>
          </div>
        </div>
        <Button
          label="Add New Choice"
          icon="pi pi-plus"
          @click="openCreateDialog"
          :disabled="!isSuperAdmin"
        />
      </div>
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
      :value="choices"
      :paginator="true"
      :rows="25"
      :filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['text', 'value']"
      sortMode="multiple"
      tableStyle="min-width: 50rem"
    >
      <template #header>
        <div class="flex justify-between">
          <InputText
            v-model="filters['global'].value"
            placeholder="Search choices..."
            class="w-full max-w-xs"
          />
        </div>
      </template>

      <template #empty> No choices found for this question. </template>

      <Column field="sort_order" header="Order" sortable style="width: 6rem">
        <template #body="{ data }">
          {{ data.sort_order }}
        </template>
      </Column>

      <Column field="value" header="Value" sortable style="width: 10rem">
        <template #body="{ data }">
          <code class="text-sm bg-gray-100 px-2 py-1 rounded">{{ data.value }}</code>
        </template>
      </Column>

      <Column field="text" header="Display Text" sortable style="min-width: 25rem">
        <template #body="{ data }">
          {{ data.text }}
        </template>
      </Column>

      <Column
        field="created_at"
        header="Created"
        sortable
        style="width: 12rem"
      >
        <template #body="{ data }">
          {{ new Date(data.created_at).toLocaleDateString() }}
        </template>
      </Column>

      <Column v-if="isSuperAdmin" style="width: 10rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              severity="secondary"
              v-tooltip.top="'Edit Choice'"
              @click="openEditDialog(data)"
              text
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              v-tooltip.top="'Delete Choice'"
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
      :header="editingChoice ? 'Edit Choice' : 'Add New Choice'"
      :modal="true"
      :style="{ width: '50vw' }"
    >
      <div class="space-y-4">
        <div>
          <label for="value" class="block text-sm font-medium mb-2">Value *</label>
          <InputText
            id="value"
            v-model="formData.value"
            class="w-full"
            placeholder="e.g., yes, no, option1"
          />
          <small class="text-gray-500"
            >The internal value stored in the database (no spaces, lowercase recommended)</small
          >
        </div>

        <div>
          <label for="text" class="block text-sm font-medium mb-2">Display Text *</label>
          <InputText
            id="text"
            v-model="formData.text"
            class="w-full"
            placeholder="e.g., Yes, No, Option 1"
          />
          <small class="text-gray-500">The text shown to users</small>
        </div>

        <div>
          <label for="sort_order" class="block text-sm font-medium mb-2">Sort Order *</label>
          <InputNumber
            id="sort_order"
            v-model="formData.sort_order"
            class="w-full"
            placeholder="Enter sort order"
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" @click="dialogVisible = false" text />
        <Button
          :label="editingChoice ? 'Update' : 'Create'"
          @click="saveChoice"
          :loading="saving"
          :disabled="!formData.value || !formData.text"
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
        Are you sure you want to delete the choice
        <strong>{{ choiceToDelete?.text }}</strong
        >? This action cannot be undone.
      </p>
      <template #footer>
        <Button label="Cancel" @click="deleteDialogVisible = false" text />
        <Button
          label="Delete"
          severity="danger"
          @click="deleteChoice"
          :loading="deleting"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { FilterMatchMode } from "@primevue/core/api"

const props = defineProps({
  surveyId: {
    type: [String, Number],
    required: true,
  },
  questionId: {
    type: [String, Number],
    required: true,
  },
})

const client = useSupabaseClient()
const currentUserProfile = useCurrentUserProfile()

const question = ref(null)
const choices = ref([])
const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingChoice = ref(null)
const choiceToDelete = ref(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const formData = ref({
  value: "",
  text: "",
  sort_order: 1,
})

// Check if user is super admin
const isSuperAdmin = computed(() => currentUserProfile.value?.role === "super_admin")

// Get category name by ID
const getCategoryName = (categoryId) => {
  if (!categoryId) return ""
  const category = categories.value.find((c) => c.id === categoryId)
  return category?.name ? `Category: ${category.name}` : ""
}

// Fetch categories
const fetchCategories = async () => {
  try {
    const { data, error } = await client
      .from("survey-categories")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) throw error
    categories.value = data || []
  } catch (error) {
    console.error("Error fetching categories:", error)
  }
}

// Fetch question details
const fetchQuestion = async () => {
  try {
    const { data, error } = await client
      .from("survey-questions")
      .select("*")
      .eq("id", props.questionId)
      .single()

    if (error) throw error
    question.value = data
  } catch (error) {
    console.error("Error fetching question:", error)
    errorMessage.value = "Failed to load question details."
  }
}

// Fetch choices for this question
const fetchChoices = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    const { data, error } = await client
      .from("survey-choices")
      .select("*")
      .eq("question_id", props.questionId)
      .order("sort_order", { ascending: true })

    if (error) throw error
    choices.value = data || []
  } catch (error) {
    console.error("Error fetching choices:", error)
    errorMessage.value = "Failed to load choices. Please try again."
  } finally {
    loading.value = false
  }
}

// Open create dialog
const openCreateDialog = () => {
  editingChoice.value = null
  formData.value = {
    value: "",
    text: "",
    sort_order: choices.value.length + 1,
  }
  dialogVisible.value = true
}

// Open edit dialog
const openEditDialog = (choice) => {
  editingChoice.value = choice
  formData.value = {
    value: choice.value,
    text: choice.text,
    sort_order: choice.sort_order,
  }
  dialogVisible.value = true
}

// Save choice (create or update)
const saveChoice = async () => {
  if (!formData.value.value || !formData.value.text) {
    errorMessage.value = "Value and text are required"
    return
  }

  saving.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    const choiceData = {
      value: formData.value.value,
      text: formData.value.text,
      sort_order: formData.value.sort_order,
      question_id: props.questionId,
    }

    if (editingChoice.value) {
      // Update existing choice
      const { error } = await client
        .from("survey-choices")
        .update(choiceData)
        .eq("id", editingChoice.value.id)

      if (error) throw error
      successMessage.value = "Choice updated successfully!"
    } else {
      // Create new choice
      const { error } = await client.from("survey-choices").insert([choiceData])

      if (error) throw error
      successMessage.value = "Choice created successfully!"
    }

    dialogVisible.value = false
    await fetchChoices()

    setTimeout(() => {
      successMessage.value = ""
    }, 3000)
  } catch (error) {
    console.error("Error saving choice:", error)
    errorMessage.value = `Failed to save choice: ${error.message}`
  } finally {
    saving.value = false
  }
}

// Confirm delete
const confirmDelete = (choice) => {
  choiceToDelete.value = choice
  deleteDialogVisible.value = true
}

// Delete choice
const deleteChoice = async () => {
  if (!choiceToDelete.value) return

  deleting.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    const { error } = await client
      .from("survey-choices")
      .delete()
      .eq("id", choiceToDelete.value.id)

    if (error) throw error

    successMessage.value = "Choice deleted successfully!"
    deleteDialogVisible.value = false
    await fetchChoices()

    setTimeout(() => {
      successMessage.value = ""
    }, 3000)
  } catch (error) {
    console.error("Error deleting choice:", error)
    errorMessage.value = `Failed to delete choice: ${error.message}`
  } finally {
    deleting.value = false
  }
}

// Fetch data on mount
onMounted(async () => {
  await Promise.all([fetchQuestion(), fetchCategories(), fetchChoices()])
})
</script>

<style lang="scss" scoped>
.manage-choices {
  :deep(.p-datatable) {
    .p-datatable-header {
      background: transparent;
      border: none;
      padding: 1rem 0;
    }
  }
}
</style>
