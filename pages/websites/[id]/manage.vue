<script setup>
definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const supabase = useSupabaseClient()
const websiteId = computed(() => route.params.id)

const website = ref(null)
const loading = ref(true)
const visibilityBrigadeContentId = ref(null)

// Fetch website to determine type
const fetchWebsite = async () => {
  loading.value = true

  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .eq("id", websiteId.value)
    .single()

  if (error) {
    console.error("Error fetching website:", error)
  } else {
    website.value = data

    // If type is visibility_brigade, fetch the content record
    if (data?.type === "visibility_brigade") {
      await fetchVisibilityBrigadeContent()
    }
  }

  loading.value = false
}

// Fetch or create visibility brigade content record
const fetchVisibilityBrigadeContent = async () => {
  const { data, error } = await supabase
    .from("visibility-brigade-content")
    .select("*")
    .eq("website_id", websiteId.value)
    .single()

  if (error && error.code === "PGRST116") {
    // No content record exists, create one
    const { data: newData, error: insertError } = await supabase
      .from("visibility-brigade-content")
      .insert([{ website_id: websiteId.value }])
      .select()
      .single()

    if (insertError) {
      console.error("Error creating visibility brigade content:", insertError)
    } else {
      visibilityBrigadeContentId.value = newData.id
    }
  } else if (data) {
    visibilityBrigadeContentId.value = data.id
  }
}

onMounted(() => {
  fetchWebsite()
})
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Your Website Content</Title>
      </Head>
    </Html>

    <div v-if="loading" class="flex justify-center items-center py-8">
      <ProgressSpinner />
    </div>

    <div v-else-if="website">
      <h1 class="mb-6">Manage Your Website Content</h1>

      <NuxtLink :to="website.url" target="_blank">
        {{ website.url }}<i class="pi pi-external-link plain ml-2" />
      </NuxtLink>
      <Divider class="my-7" />

      <!-- Visibility Brigade Content -->
      <div v-if="website.type === 'visibility_brigade' && visibilityBrigadeContentId">
        <WebsitesManageVisibilityBrigade :content-id="visibilityBrigadeContentId" />
      </div>

      <!-- No type assigned -->
      <div v-else-if="!website.type">
        <p class="text-sm">
          No website type assigned. Please set a type in the website settings.
        </p>
      </div>

      <!-- Unknown type -->
      <div v-else>
        <p class="text-sm">
          No content management available for this website type: {{ website.type }}
        </p>
      </div>
    </div>

    <div v-else>
      <p class="text-sm">Website not found.</p>
    </div>
  </div>
</template>
