<script setup>
definePageMeta({
  layout: "blank",
})

const supabase = useSupabaseClient()
const route = useRoute()

// @nuxtjs/supabase v2 defaults to PKCE flow.
// Invite links arrive with ?code= which must be exchanged for a session.
onMounted(async () => {
  const code = route.query.code

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(String(code))
    if (error) {
      console.error("Error exchanging invite code:", error)
    }
  }

  // Redirect regardless — if no code, the session may already exist (e.g. retry)
  window.location.href = "/dashboard"
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
