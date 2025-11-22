<script setup>
const supabase = useSupabaseClient()
const candidate = ref(null)
const route = useRoute()

const getCandidate = async () => {
  const { data, error } = await supabase
    .from("candidates")
    .select(`*`)
    .eq("slug", route.params.slug)
  if (error) {
    console.error(error)
  } else {
    candidate.value = data[0] // Get first item since it's an array
  }
}

const hasSocialMedia = computed(() => {
  if (!candidate.value) return false
  return (
    candidate.value.website ||
    candidate.value.tiktok ||
    candidate.value.instagram ||
    candidate.value.bluesky ||
    candidate.value.youtube
  )
})

onMounted(async () => {
  getCandidate()
})
</script>

<template>
  <section v-if="candidate" class="candidate-detail container p-4">
    <!-- Hero Section -->
    <div class="rounded-xl mb-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Image -->
        <div class="lg:col-span-1">
          <img
            :src="candidate.image"
            :alt="candidate.name"
            class="w-full rounded-xl shadow-lg"
          />
        </div>

        <!-- Main Info -->
        <div class="lg:col-span-2 p-4">
          <div class="mb-4">
            <p
              v-if="candidate.party"
              :class="[
                'inline-block text-white px-4 py-1 rounded text-sm font-bold uppercase',
                candidate.party === 'Democrat'
                  ? 'bg-blue'
                  : candidate.party === 'Republican'
                  ? 'bg-red'
                  : candidate.party === 'Independent'
                  ? 'bg-purple'
                  : 'bg-gray',
              ]"
            >
              {{ candidate.party }}
            </p>
            <p
              v-if="candidate.residence"
              class="ml-2 inline-block bg-gray px-4 py-1 rounded text-sm font-bold uppercase"
            >
              {{ candidate.residence }}
            </p>
          </div>
          <h1 class="mb-4">{{ candidate.name }}</h1>
          <p v-if="candidate.micro_bio" class="like-h3 mb-4">
            {{ candidate.micro_bio }}
          </p>

          <!-- Biography Section -->
          <template v-if="candidate.bio">
            <p v-html="candidate.bio" class="mb-6" />
          </template>

          <!-- Social Media Links -->
          <div v-if="hasSocialMedia" class="flex flex-col gap-3 mb-6">
            <a
              v-if="candidate.website_url"
              :href="candidate.website_url"
              target="_blank"
              aria-label="Website"
              class="text-black plain flex items-center"
            >
              <i class="text-2xl pi pi-globe" />
              <p class="small ml-2">{{ formatUrl(candidate.website_url) }}</p>
            </a>
            <a
              v-if="candidate.tiktok"
              :href="candidate.tiktok"
              target="_blank"
              aria-label="TikTok"
              class="text-black plain flex items-center"
            >
              <i class="text-2xl pi pi-tiktok" />
              <div class="small ml-2">{{ candidate.tiktok }}</div>
            </a>
            <a
              v-if="candidate.instagram"
              :href="candidate.instagram"
              target="_blank"
              aria-label="Instagram"
              class="text-black plain flex items-center"
            >
              <i class="text-2xl pi pi-instagram" />
              <div class="small ml-2">{{ candidate.instagram }}</div>
            </a>
            <a
              v-if="candidate.bluesky"
              :href="candidate.bluesky"
              target="_blank"
              aria-label="Bluesky"
              class="text-black plain flex items-center"
            >
              <Bluesky class="size2xl" />
              <div class="small ml-2">{{ candidate.bluesky }}</div>
            </a>
            <a
              v-if="candidate.youtube"
              :href="candidate.youtube"
              target="_blank"
              aria-label="YouTube"
              class="text-black plain flex items-center"
            >
              <i class="text-2xl pi pi-youtube" />
              <div class="small ml-2">{{ candidate.youtube }}</div>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Info -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16 mb-8">
      <div class="lg:col-span-2">
        <template v-if="candidate.experience">
          <h2 class="mb-4">Experience</h2>
          <p v-html="candidate.experience" class="mb-8" />
        </template>

        <template v-if="candidate.announcement_url || candidate.video_url">
          <h2 class="mb-4">Key Links</h2>
          <ul>
            <li v-if="candidate.announcement_url">
              <a :href="candidate.announcement_url" target="_blank">
                Announcement Video
              </a>
            </li>
            <li v-if="candidate.video_url">
              <a :href="candidate.video_url" target="_blank"> Campaign Video </a>
            </li>
          </ul>
        </template>

        <template v-if="candidate.endorsements">
          <h2 class="mb-4">Endorsements</h2>
          <p v-html="candidate.endorsements" class="mb-8" />
        </template>

        <template v-if="candidate.special_interests">
          <h2 class="mb-4">Special Interests</h2>
          <p v-html="candidate.special_interests" class="mb-8" />
        </template>
      </div>
      <div>
        <h2 class="mb-4">PAC Funding</h2>
        <p class="mb-2">
          <span class="font-bold">Corporate PACS?</span>
          {{ candidate.corporate_pacs || "No Position On Record" }}
        </p>
        <p class="mb-2">
          <span class="font-bold">AIPAC?</span>
          {{ candidate.aipac || "No Position On Record" }}
        </p>
        <p class="mb-2">
          <span class="font-bold">Any PACs?</span>
          {{ candidate.any_pacs || "No Position On Record" }}
        </p>

        <div v-if="candidate.funding" class="mt-8">
          <h2 class="mb-4">Funds Raised</h2>
          <p v-html="candidate.funding" class="mb-8" />
        </div>
      </div>
    </div>

    <!-- Back Button -->
    <NuxtLink to="/">
      <Button label="Back to All Candidates" icon="pi pi-arrow-left" />
    </NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
.candidate-detail {
  li {
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }
}
</style>
