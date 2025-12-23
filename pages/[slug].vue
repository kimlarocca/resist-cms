<template>
  <div>
    <div v-if="pending" class="text-center py-12">
      <ProgressSpinner />
    </div>
    <div v-else-if="error || !website" class="text-center py-12">
      <p class="text-lg">Website not found</p>
    </div>
    <VisibilityBrigadePage v-else-if="type === 'visibility-brigade'" />
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
