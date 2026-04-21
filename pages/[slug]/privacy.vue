<template>
  <div class="visibility-brigade">
    <Html lang="en">
      <Head>
        <Title>{{ website?.title }} | Privacy Policy</Title>
      </Head>
    </Html>
    <VisibilityBrigadeVbHeader />
    <section class="p-6 py-16 pt-32">
      <h1 class="mb-8">Privacy Policy</h1>
      <div v-if="website?.privacy_policy" v-html="website.privacy_policy" class="prose" />
      <p v-else class="text-gray-500">No privacy policy available.</p>
    </section>
  </div>
  <VisibilityBrigadeVbFooter />
</template>

<script setup>
definePageMeta({
  layout: "empty",
})

const route = useRoute()
const supabase = useSupabaseClient()
const slug = computed(() => route.params.slug)

const { data: website } = await useAsyncData(`privacy-${slug.value}`, async () => {
  const { data, error } = await supabase
    .from("websites")
    .select("id, title, privacy_policy")
    .eq("slug", slug.value)
    .single()

  if (error) throw error
  return data
})
</script>
