<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Sign Up</Title>
      </Head>
    </Html>
    <Logo class="mb-3 ml-1" />
    <hr class="w-44 ml-0 mb-8" />
    <h1 class="mb-6">Join The Resistance</h1>
    <p class="mb-4">Please fill out the form below to sign up for an account.</p>
    <supabase-signup-with-email class="mb-4" />
    <p class="text-xs">Already have an account? <nuxt-link to="/">Login</nuxt-link></p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "blank",
})
const currentUser = useSupabaseUser()
// const client = useSupabaseClient()
// const user = await client.auth.getUser()
// const session = await client.auth.getSession()

// // check supabase session for logged in user
// if (user?.data?.user) {
//   currentUser.value = user?.data?.user
// } else if (session?.data?.session?.user) {
//   currentUser.value = session?.data?.session?.user
// }

onMounted(() => {
  if (currentUser.value) {
    window.location.href = "/dashboard"
  }
})
</script>
