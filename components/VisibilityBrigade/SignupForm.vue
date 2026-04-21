<template>
  <div class="vb-signup-form">
    <ProgressSpinner v-if="loading" class="my-8" />

    <div v-else-if="submitted" class="text-center py-12">
      <i class="pi pi-check-circle text-5xl text-green-500 mb-4 block" />
      <h2 class="mb-4">Thank you for signing up!</h2>
      <p class="text-gray-600">We'll be in touch soon.</p>
    </div>

    <form v-else-if="fields.length" @submit.prevent="submitForm" novalidate>
      <div v-for="field in fields" :key="field.id" class="mb-6">
        <label
          v-if="field.field_type !== 'checkbox'"
          :for="`field-${field.id}`"
          class="block font-medium mb-2"
        >
          {{ field.label }}
          <span
            v-if="field.required || field.field_type === 'email'"
            class="text-red-500 ml-1"
            >*</span
          >
        </label>

        <!-- Text -->
        <InputText
          v-if="field.field_type === 'text'"
          :id="`field-${field.id}`"
          v-model="formValues[field.id]"
          :placeholder="field.placeholder || ''"
          :class="{ 'p-invalid': errors[field.id] }"
          class="w-full"
        />

        <!-- Email -->
        <InputText
          v-else-if="field.field_type === 'email'"
          :id="`field-${field.id}`"
          v-model="formValues[field.id]"
          type="email"
          :placeholder="field.placeholder || ''"
          :class="{ 'p-invalid': errors[field.id] }"
          class="w-full"
        />

        <!-- Phone -->
        <InputText
          v-else-if="field.field_type === 'phone'"
          :id="`field-${field.id}`"
          v-model="formValues[field.id]"
          type="tel"
          :placeholder="field.placeholder || ''"
          :class="{ 'p-invalid': errors[field.id] }"
          class="w-full"
        />

        <!-- Textarea -->
        <Textarea
          v-else-if="field.field_type === 'textarea'"
          :id="`field-${field.id}`"
          v-model="formValues[field.id]"
          :placeholder="field.placeholder || ''"
          :class="{ 'p-invalid': errors[field.id] }"
          rows="4"
          class="w-full"
        />

        <!-- Checkbox (single) -->
        <div v-else-if="field.field_type === 'checkbox'" class="flex items-center gap-2">
          <Checkbox
            :id="`field-${field.id}`"
            v-model="formValues[field.id]"
            :binary="true"
            :class="{ 'p-invalid': errors[field.id] }"
          />
          <label :for="`field-${field.id}`" class="font-medium cursor-pointer">
            {{ field.label }}
            <span v-if="field.required" class="text-red-500 ml-1">*</span>
          </label>
        </div>

        <!-- Radio buttons -->
        <div v-else-if="field.field_type === 'radio'" class="flex flex-col gap-2">
          <div
            v-for="option in parseOptions(field.options)"
            :key="option"
            class="flex items-center gap-2"
          >
            <RadioButton
              :id="`field-${field.id}-${option}`"
              v-model="formValues[field.id]"
              :value="option"
              :class="{ 'p-invalid': errors[field.id] }"
            />
            <label :for="`field-${field.id}-${option}`">{{ option }}</label>
          </div>
        </div>

        <!-- Checkboxes (multiple) -->
        <div v-else-if="field.field_type === 'checkboxes'" class="flex flex-col gap-2">
          <div
            v-for="option in parseOptions(field.options)"
            :key="option"
            class="flex items-center gap-2"
          >
            <Checkbox
              :id="`field-${field.id}-${option}`"
              v-model="formValues[field.id]"
              :value="option"
              :class="{ 'p-invalid': errors[field.id] }"
            />
            <label :for="`field-${field.id}-${option}`">{{ option }}</label>
          </div>
        </div>

        <small v-if="errors[field.id]" class="text-red-500 block mt-1">
          {{ errors[field.id] }}
        </small>
      </div>

      <Message v-if="errorMessage" severity="error" class="mb-4">
        {{ errorMessage }}
      </Message>

      <Button type="submit" label="Submit" :loading="submitting" class="mt-2" />

      <Message v-if="hasValidationErrors" severity="warn" class="mt-4">
        Please fix the errors above before submitting.
      </Message>
    </form>

    <div v-else class="text-center py-12 text-gray-500">
      <p>No signup form available.</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  websiteId: {
    type: Number,
    required: true,
  },
})

const supabase = useSupabaseClient()

const fields = ref([])
const formValues = ref({})
const errors = ref({})
const loading = ref(true)
const submitting = ref(false)
const submitted = ref(false)
const errorMessage = ref("")

const hasValidationErrors = computed(() => Object.keys(errors.value).length > 0)

const parseOptions = (options) => {
  if (!options) return []
  if (Array.isArray(options)) return options
  return []
}

const fetchFields = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from("visibility-brigade-forms")
    .select("*")
    .eq("website_id", props.websiteId)
    .eq("visible", true)
    .order("sort_order")

  if (error) {
    console.error("Error fetching form fields:", error)
  } else {
    // Ensure email field always appears first
    const sorted = (data || []).slice().sort((a, b) => {
      if (a.field_type === "email" && b.field_type !== "email") return -1
      if (a.field_type !== "email" && b.field_type === "email") return 1
      return 0
    })
    fields.value = sorted
    // Initialize form values with defaults
    fields.value.forEach((field) => {
      if (field.field_type === "checkboxes") {
        formValues.value[field.id] = []
      } else if (field.field_type === "checkbox") {
        formValues.value[field.id] = false
      } else {
        formValues.value[field.id] = field.default_value || ""
      }
    })
  }
  loading.value = false
}

const validate = () => {
  errors.value = {}
  let valid = true

  fields.value.forEach((field) => {
    // Email fields are always required
    const isRequired = field.required || field.field_type === "email"
    if (!isRequired) return
    const val = formValues.value[field.id]

    if (
      val === null ||
      val === undefined ||
      val === "" ||
      (Array.isArray(val) && val.length === 0) ||
      val === false
    ) {
      errors.value[field.id] = `This field is required.`
      valid = false
    }

    if (field.field_type === "email" && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(val)) {
        errors.value[field.id] = "Please enter a valid email address."
        valid = false
      }
    }
  })

  return valid
}

const submitForm = async () => {
  if (!validate()) return

  submitting.value = true
  errorMessage.value = ""

  try {
    // Build named form_data object using field labels as keys
    const formData = {}
    fields.value.forEach((field) => {
      formData[field.label] = formValues.value[field.id]
    })

    // Extract email if present
    const emailField = fields.value.find((f) => f.field_type === "email")
    const emailValue = emailField ? formValues.value[emailField.id] || null : null

    // Save full submission
    const { error: submissionError } = await supabase
      .from("visibility-brigade-submissions")
      .insert([{ website_id: props.websiteId, form_data: formData, email: emailValue }])

    if (submissionError) throw submissionError

    // Also save email to email-list if an email field exists
    if (emailField && emailValue) {
      await supabase.from("email-list").insert([
        {
          email: emailValue,
          source: `vb-website-${props.websiteId}`,
        },
      ])
    }

    submitted.value = true
  } catch (error) {
    console.error("Error submitting form:", error)
    errorMessage.value = "Something went wrong. Please try again."
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchFields()
})
</script>
