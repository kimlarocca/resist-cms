<script setup>
definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const client = useSupabaseClient()
const websiteId = computed(() => route.params.id)
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Resist CMS | Manage Website</Title>
      </Head>
    </Html>
    <h1 class="mb-6">Manage Website</h1>
    <Divider class="my-7" />
    <WebsitesManageWebsite :website-id="websiteId" />
  </div>
</template>
