<script setup>
definePageMeta({
  layout: "blank",
})

const currentUser = useSupabaseUser()
const client = useSupabaseClient()
const user = await client.auth.getUser()
const session = useSupabaseSession()
const currentUserProfile = useCurrentUserProfile()

console.log("Current session:", session.value)

// check supabase session for a logged in user
if (user?.data?.user) {
  currentUser.value = user?.data?.user
} else if (session?.data?.session?.user) {
  currentUser.value = session?.data?.session?.user
}

onMounted(async () => {
  if (!currentUserProfile.value) {
    try {
      currentUserProfile.value = await waitForCurrentUserProfile()
    } catch (err) {
      console.error("waiting aborted or failed", err)
    }
  }
  // redirect to the dashboard if the user is already logged in
  if (currentUser.value && currentUserProfile.value?.is_active) {
    window.location.href = "/dashboard"
  }
  if (currentUser.value && !currentUserProfile.value?.is_active) {
    window.location.href = "/setup"
  }
})
</script>

<template>
  <div class="p-4 text-center">
    <h1 class="mb-4">Welcome</h1>
    <SupabaseLoginWithEmail class="mb-6" />
    <p class="small">
      <NuxtLink to="/forgot-password">Forgot Password?</NuxtLink>
    </p>
  </div>
</template>
