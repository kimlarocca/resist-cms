<script setup>
definePageMeta({
  layout: "blank",
})

const supabase = useSupabaseClient()
const route = useRoute()
const error = ref(null)

onMounted(async () => {
  const token_hash = route.query.token_hash
  const type = route.query.type
  const next = route.query.next || "/accept-invite"

  if (!token_hash || !type) {
    error.value = "Invalid confirmation link."
    return
  }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash,
    type,
  })

  if (verifyError) {
    error.value = verifyError.message
    return
  }

  return navigateTo(next)
})
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Confirming…</Title>
      </Head>
    </Html>
    <Logo class="mb-3 ml-1" />
    <hr class="w-44 ml-0 mb-8" />
    <div v-if="error" class="flex items-center gap-3 text-red-500">
      <i class="pi pi-exclamation-circle" />
      <span>{{ error }}</span>
    </div>
    <div v-else class="flex items-center gap-3">
      <ProgressSpinner style="width: 2rem; height: 2rem" />
      <span>Verifying your link…</span>
    </div>
  </div>
</template>
