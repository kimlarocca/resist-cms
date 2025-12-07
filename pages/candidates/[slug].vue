<script setup>
definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const client = useSupabaseClient()

const slug = computed(() => route.params.slug)
const currentRace = ref(null)

// Fetch race details
const fetchRaceDetails = async () => {
  if (!slug.value) return

  try {
    const { data, error } = await client
      .from("races")
      .select("*")
      .eq("slug", slug.value)
      .single()

    if (error) throw error
    currentRace.value = data
  } catch (error) {
    console.error("Error fetching race details:", error)
  }
}

onMounted(() => {
  fetchRaceDetails()
})

watch(slug, () => {
  fetchRaceDetails()
})
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Candidates</Title>
      </Head>
    </Html>

    <h1 class="mb-6">Manage Candidates</h1>
    <p>
      <NuxtLink to="/races">All Races</NuxtLink>
      <span v-if="currentRace"> | {{ currentRace.name }}</span>
    </p>
    <Divider class="my-7" />

    <CandidatesManageCandidates v-if="slug" :race-slug="slug" />
  </div>
</template>
