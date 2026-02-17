<template>
  <div class="manage-questions">
    <div class="mb-6">
      <NuxtLink to="/surveys">
        <i class="pi pi-arrow-left mr-2" /> Back To Surveys</NuxtLink
      >
      <div class="flex justify-between items-center mt-12">
        <div>
          <h2 class="mb-2">{{ survey?.name }}</h2>
          <p class="text-gray-600">{{ survey?.description }}</p>
        </div>
        <Button
          label="Create New Question"
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
      :value="questions"
      :paginator="true"
      :rows="25"
      :filters="filters"
      filterDisplay="menu"
      :globalFilterFields="['title', 'question_type']"
      sortMode="multiple"
      tableStyle="min-width: 50rem"
    >
      <template #header>
        <div class="flex justify-between">
          <InputText
            v-model="filters['global'].value"
            placeholder="Search questions..."
            class="w-full max-w-xs"
          />
        </div>
      </template>

      <template #empty> No questions found for this survey. </template>

      <Column field="sort_order" header="Order" sortable style="width: 6rem">
        <template #body="{ data }">
          {{ data.sort_order }}
        </template>
      </Column>

      <Column field="title" header="Question" sortable style="min-width: 25rem">
        <template #body="{ data }">
          <div>
            <strong>{{ data.title }}</strong>
            <div class="text-xs text-gray-500 mt-1">Type: {{ data.question_type }}</div>
          </div>
        </template>
      </Column>

      <Column field="category_id" header="Category" sortable style="width: 12rem">
        <template #body="{ data }">
          {{ getCategoryName(data.category_id) }}
        </template>
      </Column>

      <Column field="show_comment_area" header="Comments" style="width: 8rem">
        <template #body="{ data }">
          <Tag
            :value="data.show_comment_area ? 'Yes' : 'No'"
            :severity="data.show_comment_area ? 'success' : 'secondary'"
          />
        </template>
      </Column>

      <Column v-if="isSuperAdmin" style="width: 15rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-list"
              severity="info"
              v-tooltip.top="'Manage Choices'"
              @click="manageChoices(data)"
              text
            />
            <Button
              icon="pi pi-pencil"
              severity="secondary"
              v-tooltip.top="'Edit Question'"
              @click="openEditDialog(data)"
              text
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              v-tooltip.top="'Delete Question'"
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
      :header="editingQuestion ? 'Edit Question' : 'Create New Question'"
      :modal="true"
      :style="{ width: '60vw' }"
    >
      <div class="space-y-4">
        <div>
          <label for="title" class="block text-sm font-medium mb-2"
            >Question Title *</label
          >
          <Textarea
            id="title"
            v-model="formData.title"
            rows="3"
            class="w-full"
            placeholder="Enter question title"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="question_type" class="block text-sm font-medium mb-2"
              >Question Type *</label
            >
            <Select
              id="question_type"
              v-model="formData.question_type"
              :options="questionTypes"
              placeholder="Select question type"
              class="w-full"
            />
          </div>

          <div>
            <label for="category_id" class="block text-sm font-medium mb-2"
              >Category *</label
            >
            <Select
              id="category_id"
              v-model="formData.category_id"
              :options="categories"
              optionLabel="name"
              optionValue="id"
              placeholder="Select category"
              class="w-full"
            />
          </div>
        </div>

        <div>
          <label for="sort_order" class="block text-sm font-medium mb-2"
            >Sort Order *</label
          >
          <InputNumber
            id="sort_order"
            v-model="formData.sort_order"
            class="w-full"
            placeholder="Enter sort order"
          />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox
            id="show_comment_area"
            v-model="formData.show_comment_area"
            :binary="true"
            :disabled="formData.question_type === 'comment'"
          />
          <label for="show_comment_area" class="block text-sm font-medium"
            >Show comment area for <strong>Nuanced Position</strong></label
          >
        </div>

        <!-- <div v-if="formData.show_comment_area">
          <label for="comment_text" class="block text-sm font-medium mb-2"
            >Nuanced Position</label
          >
          <InputText
            id="comment_text"
            v-model="formData.comment_text"
            class="w-full"
            placeholder="Optional: enter custom comment label"
          />
          <p class="text-xs text-gray-500 mt-3">
            If left blank, the comment area will be labeled "Nuanced Position".
          </p>
        </div> -->
      </div>

      <template #footer>
        <Button label="Cancel" @click="dialogVisible = false" text />
        <Button
          :label="editingQuestion ? 'Update' : 'Create'"
          @click="saveQuestion"
          :loading="saving"
          :disabled="!formData.title || !formData.question_type || !formData.category_id"
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
        Are you sure you want to delete this question? This action cannot be undone and
        will also delete all associated choices.
      </p>
      <template #footer>
        <Button label="Cancel" @click="deleteDialogVisible = false" text />
        <Button
          label="Delete"
          severity="danger"
          @click="deleteQuestion"
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
})

const client = useSupabaseClient()
const currentUserProfile = useCurrentUserProfile()

const survey = ref(null)
const questions = ref([])
const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const errorMessage = ref("")
const successMessage = ref("")

const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const editingQuestion = ref(null)
const questionToDelete = ref(null)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
})

const questionTypes = ["comment", "radiogroup"]

const formData = ref({
  title: "",
  question_type: null,
  category_id: null,
  sort_order: 1,
  show_comment_area: false,
  comment_text: "",
})

// Check if user is super admin
const isSuperAdmin = computed(() => currentUserProfile.value?.role === "super_admin")

// Get category name by ID
const getCategoryName = (categoryId) => {
  if (!categoryId) return "—"
  const category = categories.value.find((c) => c.id === categoryId)
  return category?.name || "Unknown"
}

// Fetch survey details
const fetchSurvey = async () => {
  try {
    const { data, error } = await client
      .from("surveys")
      .select("*")
      .eq("id", props.surveyId)
      .single()

    if (error) throw error
    survey.value = data
  } catch (error) {
    console.error("Error fetching survey:", error)
    errorMessage.value = "Failed to load survey details."
  }
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

// Fetch questions for this survey
const fetchQuestions = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    const { data, error } = await client
      .from("survey-questions")
      .select("*")
      .eq("survey_id", props.surveyId)
      .order("sort_order", { ascending: true })

    if (error) throw error
    questions.value = data || []
  } catch (error) {
    console.error("Error fetching questions:", error)
    errorMessage.value = "Failed to load questions. Please try again."
  } finally {
    loading.value = false
  }
}

// Open create dialog
const openCreateDialog = () => {
  editingQuestion.value = null
  formData.value = {
    title: "",
    question_type: null,
    category_id: null,
    sort_order: questions.value.length + 1,
    show_comment_area: false,
    comment_text: "",
  }
  dialogVisible.value = true
}

// Open edit dialog
const openEditDialog = (question) => {
  editingQuestion.value = question
  formData.value = {
    title: question.title,
    question_type: question.question_type,
    category_id: question.category_id,
    sort_order: question.sort_order,
    show_comment_area: question.show_comment_area || false,
    comment_text: question.comment_text || "",
  }
  dialogVisible.value = true
}

// Save question (create or update)
const saveQuestion = async () => {
  if (
    !formData.value.title ||
    !formData.value.question_type ||
    !formData.value.category_id
  ) {
    errorMessage.value = "Question title, type, and category are required"
    return
  }

  saving.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    const questionData = {
      title: formData.value.title,
      question_type: formData.value.question_type,
      category_id: formData.value.category_id || null,
      sort_order: formData.value.sort_order,
      show_comment_area: formData.value.show_comment_area,
      comment_text: formData.value.comment_text || null,
      survey_id: props.surveyId,
    }

    if (editingQuestion.value) {
      // Update existing question
      const { error } = await client
        .from("survey-questions")
        .update(questionData)
        .eq("id", editingQuestion.value.id)

      if (error) throw error
      successMessage.value = "Question updated successfully!"
    } else {
      // Create new question
      const { data: newQuestion, error } = await client
        .from("survey-questions")
        .insert([questionData])
        .select()
        .single()

      if (error) throw error

      // If radiogroup, create default choices
      if (formData.value.question_type === "radiogroup" && newQuestion) {
        const defaultChoices = [
          {
            question_id: newQuestion.id,
            value: "no",
            text: "No",
            sort_order: 1,
          },
          {
            question_id: newQuestion.id,
            value: "yes",
            text: "Yes",
            sort_order: 2,
          },
          {
            question_id: newQuestion.id,
            value: "no_response",
            text: "No Response",
            sort_order: 3,
          },
        ]

        const { error: choicesError } = await client
          .from("survey-choices")
          .insert(defaultChoices)

        if (choicesError) {
          console.error("Error creating default choices:", choicesError)
          // Don't fail the whole operation, just log the error
        }
      }

      successMessage.value = "Question created successfully!"
    }

    dialogVisible.value = false
    await fetchQuestions()

    setTimeout(() => {
      successMessage.value = ""
    }, 3000)
  } catch (error) {
    console.error("Error saving question:", error)
    errorMessage.value = `Failed to save question: ${error.message}`
  } finally {
    saving.value = false
  }
}

// Confirm delete
const confirmDelete = (question) => {
  questionToDelete.value = question
  deleteDialogVisible.value = true
}

// Delete question
const deleteQuestion = async () => {
  if (!questionToDelete.value) return

  deleting.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    const { error } = await client
      .from("survey-questions")
      .delete()
      .eq("id", questionToDelete.value.id)

    if (error) throw error

    successMessage.value = "Question deleted successfully!"
    deleteDialogVisible.value = false
    await fetchQuestions()

    setTimeout(() => {
      successMessage.value = ""
    }, 3000)
  } catch (error) {
    console.error("Error deleting question:", error)
    errorMessage.value = `Failed to delete question: ${error.message}`
  } finally {
    deleting.value = false
  }
}

// Watch question_type to disable show_comment_area for comment type
watch(
  () => formData.value.question_type,
  (newType) => {
    if (newType === "comment") {
      formData.value.show_comment_area = false
    }
  }
)

// Navigate to manage choices
const manageChoices = (question) => {
  navigateTo(`/surveys/${props.surveyId}/questions/${question.id}/choices`)
}

// Fetch data on mount
onMounted(async () => {
  await Promise.all([fetchSurvey(), fetchCategories(), fetchQuestions()])
})
</script>

<style lang="scss" scoped>
.manage-questions {
  :deep(.p-datatable) {
    .p-datatable-header {
      background: transparent;
      border: none;
      padding: 1rem 0;
    }
  }
}
</style>
