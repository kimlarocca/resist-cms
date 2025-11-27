<script setup>
definePageMeta({
  layout: "blank",
})

const user = useSupabaseUser()
watch(
  user,
  () => {
    if (user.value) {
      return navigateTo("/dashboard")
    }
  },
  { immediate: true }
)
</script>

<template>
  <div class="container p-4">
    <Logo class="mb-3 ml-1" />
    <hr class="w-44 ml-0 mb-8" />
    <h1 class="mb-6">Welcome To The Resistance</h1>
    <supabase-login-with-email class="mb-4" />
    <p class="text-xs"><nuxt-link to="/forgot-password">Forgot password?</nuxt-link></p>
  </div>
</template>
