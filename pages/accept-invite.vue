<script setup>
definePageMeta({
  layout: "blank",
})

const supabase = useSupabaseClient()

// Wait for Supabase to process the hash token and sign the user in,
// then redirect to dashboard where they'll be prompted to set a password.
onMounted(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
    if ((event === "SIGNED_IN" || event === "USER_UPDATED") && newSession) {
      subscription.unsubscribe()
      navigateTo("/dashboard")
    }
  })
})
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Accept Invitation</Title>
      </Head>
    </Html>
    <Logo class="mb-3 ml-1" />
    <hr class="w-44 ml-0 mb-8" />
    <div class="flex items-center gap-3">
      <ProgressSpinner style="width: 2rem; height: 2rem" />
      <span>Verifying your invitation…</span>
    </div>
  </div>
</template>

