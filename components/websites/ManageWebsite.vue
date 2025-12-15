<template>
  <div v-if="loading" class="flex justify-center items-center py-8">
    <ProgressSpinner
      style="width: 50px; height: 50px"
      strokeWidth="4"
      animationDuration="1s"
    />
  </div>
  <div v-else-if="website">
    <!-- URL field - editable for super_admin only -->
    <div v-if="isSuperAdmin" class="mb-4">
      <FloatLabel variant="on">
        <InputText id="url" v-model="url" @change="updateWebsite" />
        <label for="url">Website URL</label>
      </FloatLabel>
    </div>
    <p v-else class="mb-6">
      <NuxtLink :to="website.url" target="_blank">{{ website.url }}</NuxtLink>
    </p>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="email" v-model="email" type="email" @change="updateWebsite" />
        <label for="email">Email Address</label>
      </FloatLabel>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="title" v-model="title" @change="updateWebsite" />
        <label for="title">Title</label>
      </FloatLabel>
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
      <p class="text-sm mt-2">
        <i class="pi pi-info-circle text-sm" />
        Your website description is for search engine optimization purposes. The ideal
        meta description length is about 120 characters, as longer descriptions get cut
        off by Google, impacting user clicks.
      </p>
    </div>

    <h3 class="text-lg font-bold mt-6 mb-4">Social Media Links</h3>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="tiktok" v-model="tiktok" @change="updateWebsite" />
        <label for="tiktok">TikTok</label>
      </FloatLabel>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="bluesky" v-model="bluesky" @change="updateWebsite" />
        <label for="bluesky">Bluesky</label>
      </FloatLabel>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="facebook" v-model="facebook" @change="updateWebsite" />
        <label for="facebook">Facebook</label>
      </FloatLabel>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="instagram" v-model="instagram" @change="updateWebsite" />
        <label for="instagram">Instagram</label>
      </FloatLabel>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="youtube" v-model="youtube" @change="updateWebsite" />
        <label for="youtube">YouTube</label>
      </FloatLabel>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="threads" v-model="threads" @change="updateWebsite" />
        <label for="threads">Threads</label>
      </FloatLabel>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="linktree" v-model="linktree" @change="updateWebsite" />
        <label for="linktree">Linktree</label>
      </FloatLabel>
    </div>

    <h3 class="text-lg font-bold mt-6 mb-4">Privacy Policy</h3>
    <SimpleEditor id="privacy_policy" v-model="privacyPolicy" rows="4" class="mb-4" />

    <h3 class="text-lg font-bold mt-6 mb-4">Terms &amp; Conditions</h3>
    <SimpleEditor id="terms" v-model="terms" rows="4" class="mb-4" />

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

// Check if user is super_admin
const isSuperAdmin = computed(() => {
  return currentUserProfile.value?.role === "super_admin"
})

// Reactive form fields
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

// Compute the effective website ID to use
const effectiveWebsiteId = computed(() => {
  return props.websiteId || currentUserProfile.value?.website_id
})

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
  }

  // Only super_admin can update the URL
  if (isSuperAdmin.value) {
    updateData.url = url.value
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
