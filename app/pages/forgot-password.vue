<template>
  <div class="text-center card">
    <h1 class="mb-4">Forgot your password?</h1>
    <p class="mb-4">
      Please enter your email address below and a magic link will be sent to
      you. Once you click on the magic link and are logged in, you may reset
      your password via your settings page.
    </p>
    <supabase-login-with-magic-link class="w400 m-auto" />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'blank',
})
</script>
