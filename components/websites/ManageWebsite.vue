<template>
  <div v-if="loading" class="flex justify-center items-center py-8">
    <ProgressSpinner
      style="width: 50px; height: 50px"
      strokeWidth="4"
      animationDuration="1s"
    />
  </div>
  <div v-else-if="website">
    <h3 class="text-lg font-bold mt-6 mb-4">Basic Information</h3>
    <!-- Type field - editable for super_admin only -->
    <div v-if="isSuperAdmin" class="border-blue p-4 mb-6">
      <Tag value="Super Admin" class="mb-6 w-fit" />
      <FloatLabel variant="on" class="mb-6">
        <Select
          class="w-full"
          id="type"
          v-model="type"
          :options="typeOptions"
          @change="updateWebsite"
        />
        <label for="type">Type</label>
      </FloatLabel>
      <FloatLabel variant="on" class="mb-6">
        <InputText id="slug" v-model="slug" @change="updateWebsite" />
        <label for="slug">Slug</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <Select
          class="w-full"
          id="product"
          v-model="product"
          :options="productOptions"
          @change="updateWebsite"
        />
        <label for="product">Product</label>
      </FloatLabel>
    </div>

    <!-- URL field - editable for super_admin only -->
    <div v-if="isSuperAdmin" class="border-blue p-4 mb-6">
      <Tag value="Super Admin" class="mb-6 w-fit" />
      <FloatLabel variant="on">
        <InputText id="url" v-model="url" @change="updateWebsite" />
        <label for="url">Website URL</label>
      </FloatLabel>
    </div>

    <p v-else class="mb-8">
      <NuxtLink :to="website.url" target="_blank">
        {{ website.url }}<i class="pi pi-external-link plain ml-2" />
      </NuxtLink>
    </p>

    <div class="mb-8">
      <label class="block text-sm font-medium mb-2">Logo Image</label>
      <SupabaseImageUploader
        v-model="logo"
        bucket="logos"
        :website-id="effectiveWebsiteId"
        @update:modelValue="updateWebsite"
      />
    </div>

    <div class="mb-6">
      <FloatLabel variant="on">
        <InputText id="email" v-model="email" type="email" @change="updateWebsite" />
        <label for="email">Email Address</label>
      </FloatLabel>
    </div>

    <div class="mb-6">
      <FloatLabel variant="on">
        <InputText id="title" v-model="title" @change="updateWebsite" />
        <label for="title">Title</label>
      </FloatLabel>
      <p class="text-sm mt-3 text-gray-600">
        <em>
          Your website title is also used for search engine optimization purposes. The
          ideal length is about 50 characters, as longer titles get cut off by Google,
          impacting user clicks.
          <span
            v-if="title?.length"
            class="p-1 rounded text-white"
            :class="title?.length > 50 ? 'bg-red' : 'bg-blue'"
          >
            Characters used: {{ title?.length }}.
          </span></em
        >
      </p>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <Textarea
          id="description"
          v-model="description"
          rows="3"
          @change="updateWebsite"
        />
        <label for="description">Description</label>
      </FloatLabel>
      <p class="text-sm mt-3 text-gray-600">
        <em>
          Your website description is for search engine optimization purposes. The ideal
          length is about 120 characters, as longer descriptions get cut off by Google,
          impacting user clicks.
          <span
            v-if="description?.length"
            class="p-1 rounded text-white"
            :class="description?.length > 120 ? 'bg-red' : 'bg-blue'"
          >
            Characters used: {{ description?.length }}.
          </span></em
        >
      </p>
    </div>

    <h3 class="text-lg font-bold mt-6 mb-4">Social Media Links</h3>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText
          id="tiktok"
          class="w-full"
          v-model="tiktok"
          type="url"
          :class="{ 'p-invalid': tiktokError }"
          @blur="validateUrl('tiktok')"
        />
        <label for="tiktok">TikTok</label>
      </FloatLabel>
      <small v-if="tiktokError" class="text-red">{{ tiktokError }}</small>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText
          id="bluesky"
          class="w-full"
          v-model="bluesky"
          type="url"
          :class="{ 'p-invalid': blueskyError }"
          @blur="validateUrl('bluesky')"
        />
        <label for="bluesky">Bluesky</label>
      </FloatLabel>
      <small v-if="blueskyError" class="text-red">{{ blueskyError }}</small>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText
          id="facebook"
          class="w-full"
          v-model="facebook"
          type="url"
          :class="{ 'p-invalid': facebookError }"
          @blur="validateUrl('facebook')"
        />
        <label for="facebook">Facebook</label>
      </FloatLabel>
      <small v-if="facebookError" class="text-red">{{ facebookError }}</small>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText
          id="instagram"
          class="w-full"
          v-model="instagram"
          type="url"
          :class="{ 'p-invalid': instagramError }"
          @blur="validateUrl('instagram')"
        />
        <label for="instagram">Instagram</label>
      </FloatLabel>
      <small v-if="instagramError" class="text-red">{{ instagramError }}</small>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText
          id="youtube"
          class="w-full"
          v-model="youtube"
          type="url"
          :class="{ 'p-invalid': youtubeError }"
          @blur="validateUrl('youtube')"
        />
        <label for="youtube">YouTube</label>
      </FloatLabel>
      <small v-if="youtubeError" class="text-red">{{ youtubeError }}</small>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText
          id="threads"
          class="w-full"
          v-model="threads"
          type="url"
          :class="{ 'p-invalid': threadsError }"
          @blur="validateUrl('threads')"
        />
        <label for="threads">Threads</label>
      </FloatLabel>
      <small v-if="threadsError" class="text-red">{{ threadsError }}</small>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText
          id="linktree"
          class="w-full"
          v-model="linktree"
          type="url"
          :class="{ 'p-invalid': linktreeError }"
          @blur="validateUrl('linktree')"
        />
        <label for="linktree">Linktree</label>
      </FloatLabel>
      <small v-if="linktreeError" class="text-red">{{ linktreeError }}</small>
    </div>

    <!-- URL field - editable for super_admin only -->
    <div v-if="isPaidUser" class="border-blue p-4 my-6">
      <Tag value="Paid Users Only" class="mb-6 w-fit" />
      <h3 class="text-lg font-bold mb-4">Privacy Policy</h3>
      <SimpleEditor id="privacy_policy" v-model="privacyPolicy" rows="4" class="mb-4" />

      <h3 class="text-lg font-bold mt-6 mb-4">Terms &amp; Conditions</h3>
      <SimpleEditor id="terms" v-model="terms" rows="4" class="mb-4" />
    </div>

    <Button label="Save Changes" icon="pi pi-check" class="mt-4" @click="updateWebsite" />

    <div class="changes-saved-toast">
      <Message
        v-if="successMessage"
        class="mb-4"
        severity="success"
        :closable="false"
        :sticky="false"
      >
        Your changes have been saved.
      </Message>
    </div>
  </div>
  <div v-else-if="!loading">
    <p class="text-sm">No website associated with your account.</p>
  </div>
</template>

<script setup>
// Accept website_id as a prop, fallback to currentUserProfile.website_id
const props = defineProps({
  websiteId: {
    type: [String, Number],
    default: null,
  },
})

const currentUserProfile = useCurrentUserProfile()
const supabase = useSupabaseClient()

const website = ref(null)
const loading = ref(true)
const successMessage = ref(false)

// Error states for URL validation
const tiktokError = ref(null)
const blueskyError = ref(null)
const facebookError = ref(null)
const instagramError = ref(null)
const youtubeError = ref(null)
const threadsError = ref(null)
const linktreeError = ref(null)

// Check if user is super_admin
const isSuperAdmin = computed(() => {
  return currentUserProfile.value?.role === "super_admin"
})

// Check if website is not free (paid user)
const isPaidUser = computed(() => {
  return website.value?.product !== "free" || product.value === "paid"
})

// Type options for the select menu
const typeOptions = ref(["visibility-brigade"])

// Product options for the select menu
const productOptions = ref(["free", "paid"])

// Reactive form fields
const type = ref(null)
const url = ref(null)
const title = ref(null)
const description = ref(null)
const email = ref(null)
const tiktok = ref(null)
const bluesky = ref(null)
const facebook = ref(null)
const instagram = ref(null)
const youtube = ref(null)
const threads = ref(null)
const linktree = ref(null)
const privacyPolicy = ref(null)
const terms = ref(null)
const logo = ref(null)
const slug = ref(null)
const product = ref(null)

// Compute the effective website ID to use
const effectiveWebsiteId = computed(() => {
  return props.websiteId || currentUserProfile.value?.website_id
})

// Validate social media URLs
const validateUrl = (field) => {
  const errorMap = {
    tiktok: tiktokError,
    bluesky: blueskyError,
    facebook: facebookError,
    instagram: instagramError,
    youtube: youtubeError,
    threads: threadsError,
    linktree: linktreeError,
  }

  const valueMap = {
    tiktok: tiktok,
    bluesky: bluesky,
    facebook: facebook,
    instagram: instagram,
    youtube: youtube,
    threads: threads,
    linktree: linktree,
  }

  const error = errorMap[field]
  const value = valueMap[field]

  error.value = null

  if (value.value && value.value.trim() !== "") {
    try {
      const url = new URL(value.value)
      if (!url.protocol.startsWith("http")) {
        error.value = "URL must start with http:// or https://"
        return
      }
    } catch {
      error.value = "Please enter a valid URL"
      return
    }
  }

  // If valid or empty, update website
  updateWebsite()
}

// Fetch the website data based on website_id from props or currentUserProfile
const fetchWebsite = async () => {
  if (!effectiveWebsiteId.value) {
    loading.value = false
    return
  }

  loading.value = true

  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .eq("id", effectiveWebsiteId.value)
    .single()

  if (error) {
    console.error("Error fetching website:", error)
  } else if (data) {
    website.value = data
    // Populate form fields
    type.value = data.type
    url.value = data.url
    title.value = data.title
    description.value = data.description
    email.value = data.email
    tiktok.value = data.tiktok
    bluesky.value = data.bluesky
    facebook.value = data.facebook
    instagram.value = data.instagram
    youtube.value = data.youtube
    threads.value = data.threads
    linktree.value = data.linktree
    privacyPolicy.value = data.privacy_policy
    terms.value = data.terms
    logo.value = data.logo
    slug.value = data.slug
    product.value = data.product
  }

  loading.value = false
}

// Update website data
const updateWebsite = async () => {
  if (!effectiveWebsiteId.value) {
    return
  }

  successMessage.value = false

  const updateData = {
    title: title.value,
    description: description.value,
    email: email.value,
    tiktok: tiktok.value,
    bluesky: bluesky.value,
    facebook: facebook.value,
    instagram: instagram.value,
    youtube: youtube.value,
    threads: threads.value,
    linktree: linktree.value,
    privacy_policy: privacyPolicy.value,
    terms: terms.value,
    logo: logo.value,
  }

  // Only super_admin can update these fields
  if (isSuperAdmin.value) {
    updateData.type = type.value
    updateData.url = url.value
    updateData.slug = slug.value
    updateData.product = product.value
  }

  const { error } = await supabase
    .from("websites")
    .update(updateData)
    .eq("id", effectiveWebsiteId.value)

  if (error) {
    console.error("Error updating website:", error)
  } else {
    successMessage.value = true
    setTimeout(() => {
      successMessage.value = false
    }, 3000)
  }
}

// Watch for changes in websiteId prop and refetch
watch(
  () => props.websiteId,
  () => {
    fetchWebsite()
  }
)

// Fetch website data on component mount
fetchWebsite()
</script>

<style scoped>
.changes-saved-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}
</style>
