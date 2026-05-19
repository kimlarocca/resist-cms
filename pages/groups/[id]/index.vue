<script setup>
definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const client = useSupabaseClient()
const websiteId = computed(() => route.params.id)
const { data: website } = await useAsyncData(`website-${websiteId.value}`, () =>
  getWebsiteData(websiteId.value)
)
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Group Settings</Title>
      </Head>
    </Html>
    <h1 class="mb-4">Manage Your Group Settings</h1>
    <NuxtLink :to="`/groups/${websiteId}/portal`" class="plain text-sm">
      <i class="pi pi-arrow-left mr-1" />Back to Team Site
    </NuxtLink>
    <Divider class="my-7" />
    <h2 v-if="website?.title" class="mb-12">{{ website?.title }}</h2>
    <GroupsManageGroup :website-id="websiteId" />
  </div>
</template>
