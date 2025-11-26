<template>
  <div class="apexchart upload-image">
    <h3 class="mb-4">Update Your Logo</h3>
    <ProgressSpinner class="inline-block mb-4" v-if="uploading" />
    <img
      v-else-if="path || logo"
      :src="path ? path : logo"
      alt="logo image"
      class="mb-4"
    />
    <p v-else class="mb-4">
      You have not added a logo yet. Please use the form below to upload one!
    </p>
    <FileUpload
      mode="basic"
      :customUpload="true"
      @uploader="uploadImage"
      accept="image/*"
      :maxFileSize="1000000"
      :fileLimit="1"
      choose-label="Upload Image"
      :auto="true"
      class="inline-block"
    />
    <p class="mt-4">
      <em>
        Image files must be less than 1MB in size, and should ideally be a
        square.
      </em>
    </p>
    <template v-if="errorMessage">
      <Message class="mt-4" severity="error">
        {{ errorMessage }}
      </Message>
    </template>
    <template v-if="successMessage">
      <Message :sticky="false" :life="5000" class="mt-4" severity="success">
        {{ successMessage }}
      </Message>
    </template>
  </div>
</template>

<script setup>
import { createClient } from '@supabase/supabase-js'

const config = useRuntimeConfig()
const supabase = createClient(config.supabaseUrl, config.supabaseKey)

const props = defineProps({
  userId: {
    type: String,
    default: '',
    required: true,
  },
  logo: {
    type: String,
    default: '',
    required: true,
  },
})

const uploading = ref(false)
const errorMessage = ref()
const successMessage = ref()
const path = ref()

const uploadImage = async (event) => {
  try {
    uploading.value = true
    const file = event.files[0]
    const fileExt = file.name.split('.').pop()
    const filePath = `${props.userId}-${Math.random()}.${fileExt}`

    let { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    path.value = `https://brwzzilslduwostxbufg.supabase.co/storage/v1/object/public/logos/${filePath}`

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: props.userId,
        updated_at: new Date().toISOString(),
        logo: path.value,
      })
      .match({ id: props.userId })
    if (error) {
      console.log(error)
      errorMessage.value = `Error: ${error}`
    } else {
      successMessage.value = 'Success! Your changes have been saved.'
    }
  } catch (error) {
    errorMessage.value = `Error: ${error}`
  } finally {
    uploading.value = false
  }
}

// watch(path, () => {
//   if (path.value) downloadImage()
// })
</script>

<style lang="scss">
.upload-image img {
  max-height: 100px;
}
</style>
