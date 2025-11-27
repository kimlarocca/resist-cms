<template>
  <div class="p-4 text-center">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Magic Link</Title>
      </Head>
    </Html>
    <Logo class="mb-3 ml-1" />
    <hr class="w-44 ml-0 mb-8" />
    <h1 class="mb-6">Magic Link</h1>
    <p>
      <a href="/dashboard">
        Please wait a few moments. If you are not automatically logged in, click here!
        Your magic link may have expired.
      </a>
    </p>
  </div>
</template>

<script setup>
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
