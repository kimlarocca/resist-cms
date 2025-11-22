<script setup>
const supabase = useSupabaseClient()
const route = useRoute()
const candidates = ref([])
const loading = ref(true)
const searchQuery = ref("")

const searchCandidates = async () => {
  loading.value = true
  searchQuery.value = route.query.query || ""

  if (!searchQuery.value) {
    candidates.value = []
    loading.value = false
    return
  }

  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .or(
      `name.ilike.%${searchQuery.value}%,micro_bio.ilike.%${searchQuery.value}%,bio.ilike.%${searchQuery.value}%,experience.ilike.%${searchQuery.value}%`
    )
    .order("party")
    .order("name")
  if (error) {
    console.error(error)
  } else {
    candidates.value = data || []
  }
  loading.value = false
}

// Watch for query parameter changes
watch(
  () => route.query.query,
  () => {
    searchCandidates()
  }
)

onMounted(() => {
  searchCandidates()
})
</script>

<template>
  <div class="container px-4 xl:px-0">
    <Html lang="en">
      <Head>
        <Title>NJ 11th Special Election | Search Results | {{ searchQuery }}</Title>
      </Head>
    </Html>

    <!-- Search Query Display -->
    <div v-if="searchQuery" class="mb-8">
      <hr class="mt-12 mb-1" />
      <p class="mb-6 uppercase small">
        {{ candidates.length }} result{{ candidates.length !== 1 ? "s" : "" }} for:
      </p>
      <h1 class="mb-6 uppercase">{{ searchQuery }}</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <ProgressSpinner />
    </div>

    <!-- No Query -->
    <div v-else-if="!searchQuery" class="bg-white rounded-xl p-8 text-center">
      <i class="pi pi-search text-6xl text-gray-400 mb-4"></i>
      <h2 class="mb-4">No Search Query</h2>
      <p class="mb-6">Please enter a search term to find candidates.</p>
    </div>

    <!-- Results -->
    <div v-else-if="candidates.length > 0">
      <Candidates :candidates="candidates" :loading="loading" />
    </div>

    <!-- No Results -->
    <div v-else class="bg-white rounded-xl pt-6">
      <i class="pi pi-search text-6xl mb-4"></i>
      <h2 class="mb-4">No Results Found</h2>
      <p class="mb-6">Please try a different search term.</p>
    </div>

    <!-- Back Button -->
    <div class="mt-12">
      <NuxtLink to="/">
        <Button label="View All Candidates" icon="pi pi-arrow-left" />
      </NuxtLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.candidate-card-details {
  position: relative;
  margin: -2rem auto 0;
  width: calc(100% - 3rem);
}
</style>
