<template>
  <div class="image-uploader">
    <ProgressSpinner class="inline-block mb-4" v-if="uploading" />

    <div v-if="currentImageUrl" class="mb-4">
      <img :src="currentImageUrl" alt="Uploaded image" class="uploaded-image" />
    </div>

    <div class="flex gap-3">
      <FileUpload
        mode="basic"
        :customUpload="true"
        @uploader="uploadImage"
        accept="image/*"
        :maxFileSize="2000000"
        :choose-label="currentImageUrl ? 'Change Image' : 'Upload Image'"
        :auto="true"
        upload-icon="pi pi-image"
      />
      <Button
        v-if="currentImageUrl"
        @click="removeImage"
        icon="pi pi-trash"
        severity="danger"
        v-tooltip.top="'Remove Image'"
      />
    </div>

    <p class="text-sm mt-3 text-gray-600">
      <em>
        Image files must be less than 2MB in size. jpg, png, webp, and gif files are
        accepted.
      </em>
    </p>

    <template v-if="errorMessage">
      <Message class="mt-4" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>
    </template>
    <template v-if="successMessage">
      <Message
        :sticky="false"
        :life="3000"
        class="mt-4"
        severity="success"
        :closable="false"
      >
        {{ successMessage }}
      </Message>
    </template>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient()
const currentUser = useSupabaseUser()

const props = defineProps({
  bucket: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    default: null,
  },
  websiteId: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(["update:modelValue"])

const uploading = ref(false)
const errorMessage = ref(null)
const successMessage = ref(null)
const currentImageUrl = ref(props.modelValue)

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    currentImageUrl.value = newValue
  }
)

const uploadImage = async (event) => {
  try {
    uploading.value = true
    errorMessage.value = null
    successMessage.value = null

    const file = event.files[0]
    const fileExt = file.name?.split(".")?.pop()
    const fileName = `${props.websiteId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`

    // Upload to specified bucket
    const { error: uploadError } = await supabase.storage
      .from(props.bucket)
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // Get public URL
    const { data: imagePublicUrl } = await supabase.storage
      .from(props.bucket)
      .getPublicUrl(fileName)

    currentImageUrl.value = imagePublicUrl.publicUrl

    // Emit the new URL to parent
    emit("update:modelValue", currentImageUrl.value)

    successMessage.value = "Success! Your image has been uploaded."
  } catch (error) {
    console.error("Upload error:", error)
    errorMessage.value = `Error: ${error.message || error}`
  } finally {
    uploading.value = false
  }
}

// Remove the image
const removeImage = () => {
  currentImageUrl.value = null
  emit("update:modelValue", null)
  successMessage.value = "Image removed."
}
</script>

<style lang="scss" scoped>
.uploaded-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  border: solid 1px var(--surface-border);
  object-fit: contain;
}
</style>
