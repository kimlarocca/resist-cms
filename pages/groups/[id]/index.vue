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
        <Title>Resist CMS | Group Settings</Title>
      </Head>
    </Html>
    <h1 class="mb-6">Manage Your Group Settings</h1>
    <Divider class="my-7" />
    <GroupsManageGroup :website-id="websiteId" />
  </div>
</template>
