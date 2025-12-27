<template>
  <div>
    <div v-if="pending" class="text-center py-12">
      <ProgressSpinner />
    </div>
    <div
      v-else-if="error || !website"
      class="flex flex-col items-center justify-center gap-6 p-4 h-screen"
    >
      <NuxtLink to="/" class="plain">
        <Logo />
      </NuxtLink>
      <img src="/images/404.png" alt="404 Not Found" />
      <h1>Page Not Found</h1>
    </div>
    <VisibilityBrigadePage
      v-else-if="type === 'visibility-brigade'"
      :website-id="website.id"
    />
  </div>
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
    return data
  }
)

const type = computed(() => website.value?.type || null)
</script>
