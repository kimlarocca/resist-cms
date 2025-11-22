<script setup>
const supabase = useSupabaseClient()
const candidate = ref(null)
const route = useRoute()
const notFound = ref(false)

const getCandidate = async () => {
  const { data, error } = await supabase
    .from("candidates")
    .select(`*`)
    .eq("slug", route.params.slug)
  if (error) {
    console.error(error)
  } else {
    if (data && data.length > 0) {
      candidate.value = data[0] // Get first item since it's an array
    } else {
      notFound.value = true
    }
  }
}

onMounted(async () => {
  getCandidate()
})
</script>

<template>
  <div>
    <Html lang="en" v-if="candidate?.name">
      <Head>
        <Title>NJ 11th Special Election | {{ candidate.name }}</Title>
      </Head>
    </Html>
    <CandidateDetail :candidate="candidate" :notFound="notFound" />

    <!-- Not Found Message -->
    <section v-if="notFound" class="container p-4 text-center py-16">
      <i class="pi pi-exclamation-triangle text-2xl text-red mb-4"></i>
      <h1 class="mb-4">404 Not Found</h1>
      <p class="mb-6">Sorry! The candidate you're looking for could not be found.</p>
      <NuxtLink to="/">
        <Button label="Back to All Candidates" icon="pi pi-arrow-left" />
      </NuxtLink>
    </section>
  </div>
</template>
