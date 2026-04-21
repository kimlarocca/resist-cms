<template>
  <div class="visibility-brigade">
    <Html lang="en">
      <Head>
        <Title>{{ website?.title }} | Terms of Service</Title>
      </Head>
    </Html>
    <VisibilityBrigadeVbHeader />
    <section class="p-6 py-16 pt-32">
      <h1 class="mb-8">Terms of Service</h1>
      <div v-if="website?.terms" v-html="website.terms" class="prose" />
      <p v-else class="text-gray-500">No terms of service available.</p>
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

const { data: website } = await useAsyncData(`terms-${slug.value}`, async () => {
  const { data, error } = await supabase
    .from("websites")
    .select("id, title, terms")
    .eq("slug", slug.value)
    .single()

  if (error) throw error
  return data
})
</script>
