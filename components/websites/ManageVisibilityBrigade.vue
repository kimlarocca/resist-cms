<template>
  <div v-if="loading" class="flex justify-center items-center py-8">
    <ProgressSpinner
      style="width: 50px; height: 50px"
      strokeWidth="4"
      animationDuration="1s"
    />
  </div>
  <div v-else-if="content">
    <h3 class="text-lg font-bold mt-6 mb-4">Hero Section</h3>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="hero_headline" v-model="heroHeadline" @change="updateContent" />
        <label for="hero_headline">Hero Headline</label>
      </FloatLabel>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Hero Text</label>
      <SimpleEditor id="hero_text" v-model="heroText" rows="4" />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Hero Image</label>
      <SupabaseImageUploader
        v-model="heroImage"
        bucket="visibility_brigade"
        :website-id="websiteId"
        @update:modelValue="updateContent"
      />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Hero Sub Image</label>
      <SupabaseImageUploader
        v-model="heroSubImage"
        bucket="visibility_brigade"
        :website-id="websiteId"
        @update:modelValue="updateContent"
      />
    </div>

    <h3 class="text-lg font-bold mt-6 mb-4">Call to Action</h3>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText id="cta_text" v-model="ctaText" @change="updateContent" />
        <label for="cta_text">CTA Text</label>
      </FloatLabel>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText
          id="cta_link"
          class="w-full"
          v-model="ctaLink"
          type="url"
          :class="{ 'p-invalid': ctaLinkError }"
          @blur="validateCtaLink"
        />
        <label for="cta_link">CTA Link</label>
      </FloatLabel>
      <small v-if="ctaLinkError" class="text-red">{{ ctaLinkError }}</small>
    </div>

    <h3 class="text-lg font-bold mt-6 mb-4">About Us Section</h3>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText
          id="about_us_headline"
          v-model="aboutUsHeadline"
          @change="updateContent"
        />
        <label for="about_us_headline">About Us Headline</label>
      </FloatLabel>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">About Us Text</label>
      <SimpleEditor id="about_us_text" v-model="aboutUsText" rows="4" />
    </div>

    <h3 class="text-lg font-bold mt-6 mb-4">Get Involved Section</h3>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText
          id="get_involved_headline"
          v-model="getInvolvedHeadline"
          @change="updateContent"
        />
        <label for="get_involved_headline">Get Involved Headline</label>
      </FloatLabel>
    </div>

    <div class="mb-4">
      <FloatLabel variant="on">
        <InputText
          id="get_involved_sub_header"
          v-model="getInvolvedSubHeader"
          @change="updateContent"
        />
        <label for="get_involved_sub_header">Get Involved Sub Header</label>
      </FloatLabel>
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Get Involved Text</label>
      <SimpleEditor id="get_involved_text" v-model="getInvolvedText" rows="4" />
    </div>

    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Get Involved Image</label>
      <SupabaseImageUploader
        v-model="getInvolvedImage"
        bucket="visibility_brigade"
        :website-id="websiteId"
        @update:modelValue="updateContent"
      />
    </div>

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
    <p class="text-sm">No content found for this Visibility Brigade website.</p>
  </div>
</template>

<script setup>
// Accept content id as a prop
const props = defineProps({
  contentId: {
    type: [String, Number],
    required: true,
  },
})

const supabase = useSupabaseClient()

const content = ref(null)
const loading = ref(true)
const successMessage = ref(false)
const ctaLinkError = ref(null)
const websiteId = ref(null)

// Reactive form fields
const heroHeadline = ref(null)
const heroText = ref(null)
const heroImage = ref(null)
const heroSubImage = ref(null)
const ctaText = ref(null)
const ctaLink = ref(null)
const aboutUsHeadline = ref(null)
const aboutUsText = ref(null)
const getInvolvedHeadline = ref(null)
const getInvolvedSubHeader = ref(null)
const getInvolvedText = ref(null)
const getInvolvedImage = ref(null)

// Fetch the content data based on content_id
const fetchContent = async () => {
  if (!props.contentId) {
    loading.value = false
    return
  }

  loading.value = true

  const { data, error } = await supabase
    .from("visibility-brigade-content")
    .select("*")
    .eq("id", props.contentId)
    .single()

  if (error) {
    console.error("Error fetching content:", error)
  } else if (data) {
    content.value = data
    websiteId.value = data.website_id
    // Populate form fields
    heroHeadline.value = data.hero_headline
    heroText.value = data.hero_text
    heroImage.value = data.hero_image
    heroSubImage.value = data.hero_sub_image
    ctaText.value = data.cta_text
    ctaLink.value = data.cta_link
    aboutUsHeadline.value = data.about_us_headline
    aboutUsText.value = data.about_us_text
    getInvolvedHeadline.value = data.get_involved_headline
    getInvolvedSubHeader.value = data.get_involved_sub_header
    getInvolvedText.value = data.get_involved_text
    getInvolvedImage.value = data.get_involved_image
  }

  loading.value = false
}

// Validate CTA Link URL
const validateCtaLink = () => {
  ctaLinkError.value = null

  if (ctaLink.value && ctaLink.value.trim() !== "") {
    try {
      const url = new URL(ctaLink.value)
      if (!url.protocol.startsWith("http")) {
        ctaLinkError.value = "URL must start with http:// or https://"
      }
    } catch {
      ctaLinkError.value = "Please enter a valid URL"
    }
  }

  // If valid, update content
  if (!ctaLinkError.value) {
    updateContent()
  }
}

// Update content data
const updateContent = async () => {
  if (!props.contentId) {
    return
  }

  successMessage.value = false

  const updateData = {
    hero_headline: heroHeadline.value,
    hero_text: heroText.value,
    hero_image: heroImage.value,
    hero_sub_image: heroSubImage.value,
    cta_text: ctaText.value,
    cta_link: ctaLink.value,
    about_us_headline: aboutUsHeadline.value,
    about_us_text: aboutUsText.value,
    get_involved_headline: getInvolvedHeadline.value,
    get_involved_sub_header: getInvolvedSubHeader.value,
    get_involved_text: getInvolvedText.value,
    get_involved_image: getInvolvedImage.value,
  }

  const { error } = await supabase
    .from("visibility-brigade-content")
    .update(updateData)
    .eq("id", props.contentId)

  if (error) {
    console.error("Error updating content:", error)
  } else {
    successMessage.value = true
    setTimeout(() => {
      successMessage.value = false
    }, 3000)
  }
}

// Watch for changes in contentId prop and refetch
watch(
  () => props.contentId,
  () => {
    fetchContent()
  }
)

// Fetch content data on component mount
fetchContent()
</script>

<style scoped>
.changes-saved-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}
</style>
