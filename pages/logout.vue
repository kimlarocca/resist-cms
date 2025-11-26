<template>
  <div class="logout">
    <Html lang="en">
      <Head>
        <Title>Resist | Logout</Title>
      </Head>
    </Html>
    <Logo class="mb-3 ml-1" />
    <hr class="w-44 ml-0 mb-8" />
    <h1 class="mb-6">You have been logged out</h1>
    <p><a href="/">Click here</a> to return to the sign in page.</p>
  </div>
</template>

<script setup>
import { useCurrentUserProfile } from "~/composables/states"

definePageMeta({
  layout: "blank",
})

// sign out from supabase
const client = useSupabaseClient()
const { error } = await client.auth.signOut()
if (error) {
  console.log("error")
}
// set the currentUserProfile composable to null
const currentUserProfile = useCurrentUserProfile()
currentUserProfile.value = null

onMounted(() => {
  // check local storage for the auth token
  if (process.client) {
    // clear localStorage
    localStorage.clear()
  }
})
</script>
