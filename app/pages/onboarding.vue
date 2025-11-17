<template>
  <div class="text-center card">
    <h1 class="mb-4">Create your account</h1>
    <supabase-signup-with-email class="w400 m-auto mb-4" />
    <p class="mb-2">
      Already have an account?
      <nuxt-link to="/">Click here to sign in</nuxt-link>
    </p>
    <p><nuxt-link to="/forgot-password">Forgot password?</nuxt-link></p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'blank',
})
</script>
