<script setup>
definePageMeta({
  layout: "blank",
})

const user = useSupabaseUser()
const { hostname } = useRequestURL()
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
    <img
      v-if="hostname === 'login.votebyvalues.com'"
      src="/images/vbv-logo.png"
      alt="Vote by values logo"
      class="w-36"
    />
    <Logo class="mb-3 ml-1" v-else />
    <hr class="w-44 ml-0 mb-8" />
    <h1 class="mb-6">Welcome To The Resistance</h1>
    <supabase-login-with-email class="mb-4" />
    <p class="text-xs"><nuxt-link to="/forgot-password">Forgot password?</nuxt-link></p>
  </div>
</template>
