<template>
  <div class="manage-signup-form">
    <Message v-if="errorMessage" severity="error" class="mb-4">
      {{ errorMessage }}
    </Message>

    <Message v-if="successMessage" severity="success" class="mb-4" :closable="false">
      {{ successMessage }}
    </Message>

    <ProgressSpinner v-if="loading" class="my-8" />

    <!-- Activate Form -->
    <div v-else-if="!formActivated" class="text-center py-12">
      <p class="text-lg text-gray-600 mb-6">
        No signup form has been set up for this website yet.
      </p>
      <Button
        label="Activate Signup Form"
        icon="pi pi-check-circle"
        @click="activateForm"
        :loading="activating"
        severity="success"
        size="large"
      />
      <p class="text-sm text-gray-500 mt-4">
        This will create a default set of form questions that you can customize.
      </p>
    </div>

    <!-- Form Questions Management -->
    <div v-else>
      <div class="mb-12">
        <h3 class="mb-4">Form Heading</h3>
        <p class="mb-4">
          This is the main heading displayed at the top of your signup form.
        </p>
        <InputText
          v-model="signupFormH1Text"
          @blur="saveIntroTextManually"
          class="w-full"
        />
      </div>

      <div class="mb-12">
        <h3 class="mb-4">Introduction Text</h3>
        <p class="mb-4">
          This text is optional and, if entered, will appear at the top of your signup
          form.
        </p>
        <SimpleEditor v-model="signupFormText" height="150px" />
        <Button
          label="Save Changes"
          @click="saveIntroTextManually"
          :loading="savingIntroText"
          class="mt-3"
        />
      </div>

      <h3 class="mb-4">Form Questions</h3>
      <div class="flex justify-between items-center mb-6">
        <p class="text-gray-600">
          Drag the ≡ handle to reorder rows, or edit the sort order number directly.
        </p>
        <div class="flex gap-2">
          <Button
            label="Preview Form"
            icon="pi pi-eye"
            severity="secondary"
            @click="previewVisible = true"
          />
          <Button label="Add New Question" icon="pi pi-plus" @click="openDialog()" />
        </div>
      </div>

      <DataTable
        :value="questions"
        :paginator="questions.length > 25"
        :rows="25"
        :rowsPerPageOptions="[25, 50]"
        stripedRows
        class="p-datatable-sm"
        @rowReorder="onRowReorder"
      >
        <Column rowReorder style="width: 3rem" />
        <Column field="sort_order" header="Order" sortable style="width: 6rem">
          <template #body="{ data }">
            <InputNumber
              v-model="data.sort_order"
              class="w-16"
              :min="1"
              @update:modelValue="updateQuestion(data)"
              size="small"
            />
          </template>
        </Column>

        <Column field="label" header="Question" sortable style="min-width: 20rem">
          <template #body="{ data }">
            <div>
              <strong>{{ data.label }}</strong>
              <div class="text-xs text-gray-500 mt-1">
                Type: {{ fieldTypeLabels[data.field_type] || data.field_type }}
                <span v-if="data.placeholder" class="ml-2">
                  | Placeholder: "{{ data.placeholder }}"
                </span>
                <span v-if="data.options">
                  | Options: {{ formatOptions(data.options) }}
                </span>
                <span v-if="data.default_value">
                  | Default: {{ data.default_value }}
                </span>
              </div>
            </div>
          </template>
        </Column>

        <Column field="field_type" header="Type" sortable style="width: 10rem">
          <template #body="{ data }">
            {{ fieldTypeLabels[data.field_type] || data.field_type }}
          </template>
        </Column>

        <Column field="visible" header="Visible" style="width: 7rem">
          <template #body="{ data }">
            <ToggleSwitch
              v-model="data.visible"
              :disabled="isProtectedField(data)"
              @update:modelValue="updateQuestion(data)"
            />
          </template>
        </Column>

        <Column field="required" header="Required" style="width: 7rem">
          <template #body="{ data }">
            <ToggleSwitch
              v-model="data.required"
              :disabled="isProtectedField(data)"
              @update:modelValue="updateQuestion(data)"
            />
          </template>
        </Column>

        <Column style="width: 8rem">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                v-if="!isProtectedField(data)"
                icon="pi pi-pencil"
                severity="info"
                size="small"
                @click="openDialog(data)"
                v-tooltip.top="'Edit'"
              />
              <Button
                v-if="!isProtectedField(data)"
                icon="pi pi-trash"
                severity="danger"
                size="small"
                @click="confirmDelete(data)"
                v-tooltip.top="'Delete'"
              />
            </div>
          </template>
        </Column>

        <template #empty>
          <div class="text-center py-8">
            No questions found. Click "Add Question" to create one.
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Create/Edit Dialog -->
    <Dialog
      v-model:visible="dialogVisible"
      :header="editingQuestion ? 'Edit Question' : 'Add New Question'"
      :modal="true"
      :style="{ width: '50vw' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    >
      <form @submit.prevent="saveQuestion" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="label" class="font-semibold required">Question Label</label>
          <InputText
            id="label"
            v-model="formData.label"
            required
            placeholder="e.g., What is your name?"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="field_type" class="font-semibold required">Field Type</label>
            <Select
              id="field_type"
              v-model="formData.field_type"
              :options="fieldTypeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select type"
              class="w-full"
              required
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="sort_order" class="font-semibold">Sort Order</label>
            <InputNumber id="sort_order" v-model="formData.sort_order" :min="1" />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="placeholder" class="font-semibold">Placeholder Text</label>
          <InputText
            id="placeholder"
            v-model="formData.placeholder"
            placeholder="Placeholder text shown in the field"
          />
        </div>

        <div v-if="showOptionsField" class="flex flex-col gap-2">
          <label for="options" class="font-semibold">Options (one per line)</label>
          <Textarea
            id="options"
            v-model="formData.optionsText"
            rows="4"
            placeholder="Yes&#10;No&#10;Other"
          />
          <small class="text-gray-500">
            Enter one option per line. For checkboxes and radio buttons.
          </small>
        </div>

        <div v-if="showDefaultValueField" class="flex flex-col gap-2">
          <label for="default_value" class="font-semibold">Default Value</label>
          <InputText
            id="default_value"
            v-model="formData.default_value"
            placeholder="Default value"
          />
        </div>

        <div class="flex gap-6">
          <div class="flex items-center gap-2">
            <Checkbox id="visible" v-model="formData.visible" :binary="true" />
            <label for="visible">Visible</label>
          </div>

          <div class="flex items-center gap-2">
            <Checkbox id="required" v-model="formData.required" :binary="true" />
            <label for="required">Required</label>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <Button
            label="Cancel"
            severity="secondary"
            @click="dialogVisible = false"
            type="button"
          />
          <Button
            :label="editingQuestion ? 'Update' : 'Create'"
            type="submit"
            :loading="saving"
          />
        </div>
      </form>
    </Dialog>

    <!-- Preview Dialog -->
    <Dialog
      v-model:visible="previewVisible"
      header="Form Preview"
      :modal="true"
      :style="{ width: '80vw', maxWidth: '95vw' }"
    >
      <VisibilityBrigadeSignupForm :website-id="Number(props.websiteId)" />
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
          Are you sure you want to delete the question
          <strong>"{{ questionToDelete?.label }}"</strong>? This action cannot be undone.
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
          @click="deleteQuestion"
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

const client = useSupabaseClient()

const questions = ref([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const activating = ref(false)
const savingIntroText = ref(false)
const formActivated = ref(false)
const errorMessage = ref("")
const successMessage = ref("")
const signupFormText = ref("")
const signupFormH1Text = ref("")

const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const previewVisible = ref(false)
const editingQuestion = ref(null)
const questionToDelete = ref(null)

const fieldTypeOptions = [
  { label: "Text Input", value: "text" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "Textarea", value: "textarea" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Radio Buttons", value: "radio" },
  { label: "Checkboxes (multiple)", value: "checkboxes" },
]

const fieldTypeLabels = {
  text: "Text Input",
  email: "Email",
  phone: "Phone",
  textarea: "Textarea",
  checkbox: "Checkbox",
  radio: "Radio Buttons",
  checkboxes: "Checkboxes",
}

const formData = ref({
  label: "",
  field_type: "text",
  placeholder: "",
  optionsText: "",
  default_value: "",
  required: false,
  visible: true,
  sort_order: 1,
})

const showOptionsField = computed(() =>
  ["radio", "checkboxes"].includes(formData.value.field_type)
)

const showDefaultValueField = computed(() =>
  ["text", "email", "phone", "radio"].includes(formData.value.field_type)
)

const isProtectedField = (data) =>
  data.field_type === "email" || data.label === "First Name" || data.label === "Last Name"

const formatOptions = (options) => {
  if (!options) return ""
  if (Array.isArray(options)) return options.join(", ")
  return JSON.stringify(options)
}

// Default questions for form activation
const getDefaultQuestions = () => [
  {
    label: "Email",
    field_type: "email",
    placeholder: null,
    options: null,
    default_value: null,
    required: true,
    visible: true,
    sort_order: 1,
  },
  {
    label: "First Name",
    field_type: "text",
    placeholder: null,
    options: null,
    default_value: null,
    required: true,
    visible: true,
    sort_order: 2,
  },
  {
    label: "Last Name",
    field_type: "text",
    placeholder: null,
    options: null,
    default_value: null,
    required: true,
    visible: true,
    sort_order: 3,
  },
  {
    label: "Phone",
    field_type: "phone",
    placeholder: null,
    options: null,
    default_value: null,
    required: false,
    visible: true,
    sort_order: 4,
  },
  {
    label: "How did you find us?",
    field_type: "textarea",
    placeholder: null,
    options: null,
    default_value: null,
    required: true,
    visible: true,
    sort_order: 5,
  },
  {
    label: "Why do you want to join our group?",
    field_type: "textarea",
    placeholder: null,
    options: null,
    default_value: null,
    required: true,
    visible: true,
    sort_order: 6,
  },
  {
    label: "Please list at least 1 of your social media handles for vetting purposes.",
    field_type: "textarea",
    placeholder:
      "This could be Facebook, Instagram, LinkedIn, Bluesky, etc. We use this to help keep our group safe.",
    options: null,
    default_value: null,
    required: true,
    visible: true,
    sort_order: 7,
  },
  {
    label:
      "Do you agree to our group rules, listed or linked in the introduction to the form?",
    field_type: "checkbox",
    placeholder: null,
    options: null,
    default_value: "false",
    required: true,
    visible: true,
    sort_order: 8,
  },
  {
    label: "Please list any contacts you have in the group.",
    field_type: "text",
    placeholder: "This helps us ensure no trolls & bots are added.",
    options: null,
    default_value: null,
    required: false,
    visible: true,
    sort_order: 9,
  },
  {
    label:
      "The Visibility Brigade is a non-violent, informal volunteer group in which we all participate with an understanding that our own actions are our personal responsibility, and we accept our own personal liability. Do you understand and accept this?",
    field_type: "checkbox",
    placeholder: null,
    options: null,
    default_value: "false",
    required: true,
    visible: true,
    sort_order: 10,
  },
  {
    label: "Emergency Contact Name",
    field_type: "text",
    placeholder: null,
    options: null,
    default_value: null,
    required: false,
    visible: true,
    sort_order: 11,
  },
  {
    label: "Emergency Contact Phone",
    field_type: "text",
    placeholder: null,
    options: null,
    default_value: null,
    required: false,
    visible: true,
    sort_order: 12,
  },
  {
    label: "Emergency Contact Info",
    field_type: "text",
    placeholder: null,
    options: null,
    default_value: null,
    required: false,
    visible: true,
    sort_order: 13,
  },
  {
    label: "What issues facing our area and country are most important to you?",
    field_type: "textarea",
    placeholder: null,
    options: null,
    default_value: null,
    required: false,
    visible: true,
    sort_order: 14,
  },
  {
    label: "In what town/city do you currently live?",
    field_type: "text",
    placeholder: null,
    options: null,
    default_value: null,
    required: false,
    visible: true,
    sort_order: 15,
  },
  {
    label: "Would you like to join our Email list?",
    field_type: "radio",
    placeholder: null,
    options: ["Yes", "No"],
    default_value: "Yes",
    required: false,
    visible: true,
    sort_order: 16,
  },
  {
    label:
      "Would you like to join our Signal group(s) for encrypted end-to-end messaging?",
    field_type: "radio",
    placeholder: null,
    options: ["Yes", "No"],
    default_value: "Yes",
    required: false,
    visible: true,
    sort_order: 17,
  },
  {
    label: "Where did you hear about us?",
    field_type: "checkboxes",
    placeholder: null,
    options: [
      "A friend",
      "Facebook",
      "Instagram",
      "From another political action group",
      "Other",
    ],
    default_value: null,
    required: false,
    visible: true,
    sort_order: 18,
  },
  {
    label: "Interested in starting your own location? Where?",
    field_type: "text",
    placeholder: "We'll help wherever we can.",
    options: null,
    default_value: null,
    required: false,
    visible: true,
    sort_order: 19,
  },
]

// Fetch existing form questions
const fetchQuestions = async () => {
  loading.value = true
  errorMessage.value = ""

  try {
    const { data, error } = await client
      .from("visibility-brigade-forms")
      .select("*")
      .eq("website_id", props.websiteId)
      .order("sort_order", { ascending: true })

    if (error) throw error

    // Lock protected fields to positions 1, 2, 3
    const raw = data || []
    const pinned = ["email", "First Name", "Last Name"]
    const pinnedItems = pinned
      .map((key) => raw.find((q) => q.field_type === key || q.label === key))
      .filter(Boolean)
    const rest = raw.filter((q) => !pinnedItems.includes(q))
    questions.value = [...pinnedItems, ...rest]
    formActivated.value = questions.value.length > 0
  } catch (error) {
    console.error("Error fetching form questions:", error)
    questions.value = []
    formActivated.value = false
  } finally {
    loading.value = false
  }
}

// Activate form with default questions
const activateForm = async () => {
  activating.value = true
  errorMessage.value = ""

  try {
    const defaults = getDefaultQuestions().map((q) => ({
      ...q,
      website_id: props.websiteId,
    }))

    const { error } = await client.from("visibility-brigade-forms").insert(defaults)

    if (error) throw error

    successMessage.value = "Signup form activated with default questions!"
    await fetchQuestions()

    setTimeout(() => {
      successMessage.value = ""
    }, 3000)
  } catch (error) {
    console.error("Error activating form:", error)
    errorMessage.value = "Failed to activate signup form."
  } finally {
    activating.value = false
  }
}

// Handle row reorder via drag and drop
const onRowReorder = async (event) => {
  // Keep Email (1), First Name (2), Last Name (3) locked in position
  const reordered = event.value
  const pinned = reordered
    .filter(
      (q) =>
        q.field_type === "email" || q.label === "First Name" || q.label === "Last Name"
    )
    .sort((a, b) => {
      const order = (q) =>
        q.field_type === "email" ? 0 : q.label === "First Name" ? 1 : 2
      return order(a) - order(b)
    })
  const rest = reordered.filter(
    (q) => q.field_type !== "email" && q.label !== "First Name" && q.label !== "Last Name"
  )
  questions.value = [...pinned, ...rest]

  // Update sort_order for all rows based on new position
  const updates = questions.value.map((q, index) => ({
    ...q,
    sort_order: index + 1,
  }))
  questions.value = updates

  try {
    for (const q of updates) {
      const { error } = await client
        .from("visibility-brigade-forms")
        .update({ sort_order: q.sort_order, updated_at: new Date().toISOString() })
        .eq("id", q.id)
      if (error) throw error
    }
  } catch (error) {
    console.error("Error saving reorder:", error)
    errorMessage.value = "Failed to save new order."
    await fetchQuestions()
  }
}

// Update a single question (for inline toggles and sort order)
const updateQuestion = async (question) => {
  try {
    const { error } = await client
      .from("visibility-brigade-forms")
      .update({
        visible: question.visible,
        required: question.required,
        sort_order: question.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("id", question.id)

    if (error) throw error
  } catch (error) {
    console.error("Error updating question:", error)
    errorMessage.value = "Failed to update question."
    await fetchQuestions()
  }
}

// Open dialog for create or edit
const openDialog = (question = null) => {
  if (question) {
    editingQuestion.value = question
    formData.value = {
      label: question.label || "",
      field_type: question.field_type || "text",
      placeholder: question.placeholder || "",
      optionsText: Array.isArray(question.options) ? question.options.join("\n") : "",
      default_value: question.default_value || "",
      required: question.required || false,
      visible: question.visible !== false,
      sort_order: question.sort_order || 1,
    }
  } else {
    editingQuestion.value = null
    formData.value = {
      label: "",
      field_type: "text",
      placeholder: "",
      optionsText: "",
      default_value: "",
      required: false,
      visible: true,
      sort_order: questions.value.length + 1,
    }
  }
  dialogVisible.value = true
  successMessage.value = ""
  errorMessage.value = ""
}

// Save question (create or update)
const saveQuestion = async () => {
  if (!formData.value.label) {
    errorMessage.value = "Question label is required."
    return
  }

  saving.value = true
  errorMessage.value = ""
  successMessage.value = ""

  try {
    // Parse options from text
    let options = null
    if (
      ["radio", "checkboxes"].includes(formData.value.field_type) &&
      formData.value.optionsText.trim()
    ) {
      options = formData.value.optionsText
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o)
    }

    const questionData = {
      label: formData.value.label,
      field_type: formData.value.field_type,
      placeholder: formData.value.placeholder || null,
      options: options,
      default_value: formData.value.default_value || null,
      required: formData.value.required,
      visible: formData.value.visible,
      sort_order: formData.value.sort_order,
      updated_at: new Date().toISOString(),
    }

    if (editingQuestion.value) {
      const { error } = await client
        .from("visibility-brigade-forms")
        .update(questionData)
        .eq("id", editingQuestion.value.id)

      if (error) throw error
      successMessage.value = "Question updated successfully!"
    } else {
      questionData.website_id = props.websiteId

      const { error } = await client
        .from("visibility-brigade-forms")
        .insert([questionData])

      if (error) throw error
      successMessage.value = "Question created successfully!"
    }

    dialogVisible.value = false
    await fetchQuestions()

    setTimeout(() => {
      successMessage.value = ""
    }, 3000)
  } catch (error) {
    console.error("Error saving question:", error)
    errorMessage.value = error.message || "Failed to save question."
  } finally {
    saving.value = false
  }
}

// Confirm delete
const confirmDelete = (question) => {
  questionToDelete.value = question
  deleteDialogVisible.value = true
  successMessage.value = ""
  errorMessage.value = ""
}

// Delete question
const deleteQuestion = async () => {
  if (!questionToDelete.value) return

  deleting.value = true
  errorMessage.value = ""

  try {
    const { error } = await client
      .from("visibility-brigade-forms")
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
    errorMessage.value = error.message || "Failed to delete question."
  } finally {
    deleting.value = false
  }
}

// Fetch signup form text from visibility-brigade-content table
const fetchSignupFormText = async () => {
  try {
    const { data, error } = await client
      .from("visibility-brigade-content")
      .select("signup_form_text, signup_form_h1_text")
      .eq("id", props.websiteId)
      .single()

    if (error) throw error
    signupFormText.value = data?.signup_form_text || ""
    signupFormH1Text.value = data?.signup_form_h1_text || ""
  } catch (error) {
    console.error("Error fetching signup form text:", error)
  }
}

// Save signup form text to visibility-brigade-content table
let saveTimeout = null
const saveSignupFormText = async () => {
  try {
    const { error } = await client
      .from("visibility-brigade-content")
      .update({
        signup_form_text: signupFormText.value,
        signup_form_h1_text: signupFormH1Text.value,
      })
      .eq("id", props.websiteId)

    if (error) throw error
  } catch (error) {
    console.error("Error saving signup form text:", error)
    errorMessage.value = "Failed to save introduction text."
  }
}

// Manual save handler with user feedback
const saveIntroTextManually = async () => {
  savingIntroText.value = true
  errorMessage.value = ""

  try {
    const { error } = await client
      .from("visibility-brigade-content")
      .update({
        signup_form_text: signupFormText.value,
        signup_form_h1_text: signupFormH1Text.value,
      })
      .eq("id", props.websiteId)

    if (error) throw error

    successMessage.value = "Introduction text saved successfully!"
    setTimeout(() => {
      successMessage.value = ""
    }, 3000)
  } catch (error) {
    console.error("Error saving signup form text:", error)
    errorMessage.value = "Failed to save introduction text."
  } finally {
    savingIntroText.value = false
  }
}

// Debounced auto-save when text changes
watch([signupFormText, signupFormH1Text], () => {
  if (!formActivated.value) return
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(saveSignupFormText, 1000)
})

// Load questions on mount
onMounted(() => {
  fetchQuestions()
  fetchSignupFormText()
})
</script>

<style scoped>
label.required::after {
  content: " *";
  color: var(--red);
}
</style>
