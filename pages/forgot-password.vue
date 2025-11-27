<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Forgot Password</Title>
      </Head>
    </Html>
    <Logo class="mb-3 ml-1" />
    <hr class="w-44 ml-0 mb-8" />
    <h1 class="mb-6">Forgot your password?</h1>
    <p class="mb-4">
      Enter your email address below and a magic link will be sent to you. Once you click
      on the magic link and are logged in, you may reset your password on your account
      settings page.
    </p>
    <supabase-login-with-magic-link class="mb-4" />
    <p class="text-xs">Already have an account? <nuxt-link to="/">Login</nuxt-link></p>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "blank",
})
</script>
