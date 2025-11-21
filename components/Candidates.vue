<script setup>
const supabase = useSupabaseClient()
const candidates = ref([])

const getCandidates = async () => {
  const { data, error } = await supabase
    .from("candidates")
    .select(`*`)
    .eq("race", "NJ-11")
    .order("party")
    .order("name")
  if (error) {
    console.error(error)
  } else {
    candidates.value = data
  }
}

onMounted(async () => {
  getCandidates()
})
</script>

<template>
  <section v-if="candidates.length" class="candidates">
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      <NuxtLink
        :to="`/${candidate.slug}`"
        class="plain"
        v-for="candidate in candidates"
        :key="candidate.id"
      >
        <div class="candidate-card rounded-xl">
          <div class="candidate-card-image z-0">
            <img
              :src="candidate.image"
              :alt="candidate.name"
              class="w-full h-auto rounded-xl"
            />
          </div>
          <div
            class="candidate-card-details bg-white border-blue z-10 rounded-xl p-2 text-center text-black h-full"
          >
            <p class="small font-bold mb-1">{{ candidate.name }}</p>
            <p class="text-sm mb-3">{{ candidate.micro_bio }}</p>
            <div class="flex space-x-4 items-center justify-center">
              <a href="/" aria-label="tiktok" class="text-xl text-black icon-link">
                <i class="pi pi-tiktok"></i>
              </a>
              <a href="/" aria-label="instagram" class="text-xl text-black icon-link">
                <i class="pi pi-instagram"></i>
              </a>
              <Bluesky />
              <a href="/" aria-label="youtube" class="text-xl text-black icon-link">
                <i class="pi pi-youtube"></i>
              </a>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<style lang="scss">
.candidate-card-details {
  position: relative;
  margin: -2rem auto 0;
  width: calc(100% - 3rem);
}
</style>
