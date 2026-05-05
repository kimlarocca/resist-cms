<script setup>
definePageMeta({
  layout: "blank",
})

const user = useSupabaseUser()

// Watch for the user to be authenticated, then redirect them
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
