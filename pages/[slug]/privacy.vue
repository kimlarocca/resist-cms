<template>
  <div class="visibility-brigade">
    <Html lang="en">
      <Head>
        <Title>{{ website?.title }} | Privacy Policy</Title>
      </Head>
    </Html>
    <VisibilityBrigadeVbHeader :website-id="website?.id" />
    <section class="p-6 py-16 pt-32">
      <h1 class="mb-8">Privacy Policy</h1>
      <div v-if="website?.privacy_policy" v-html="website.privacy_policy" class="prose" />
      <p v-else class="text-gray-500">No privacy policy available.</p>
    </section>
  </div>
  <VisibilityBrigadeVbFooter :website-id="website?.id" />
</template>

<script lang="ts" setup>
definePageMeta({
  layout: "empty",
})

const route = useRoute()
const supabase = useSupabaseClient()

const slug = computed(() => route.params.slug as string)

const { data: website, pending, error } = await useAsyncData(
  `website-${slug.value}`,
  async () => {
    const { data, error } = await supabase
      .from("websites")
      .select("*")
      .eq("slug", slug.value)
      .single()

    if (error) throw error
    if (!data?.published) return null
    return data
  }
)
</script>
