<script setup>
definePageMeta({
  middleware: "auth",
})

const route = useRoute()
const websiteId = computed(() => route.params.id)
const { data: website } = await useAsyncData(`website-${websiteId.value}`, () =>
  getWebsiteData(websiteId.value)
)
</script>

<template>
  <div class="container p-4">
    <Html lang="en">
      <Head>
        <Title>Manage Links</Title>
      </Head>
    </Html>
    <NuxtLink v-if="website?.title" :to="`/groups/${websiteId}/portal`" class="like-h3 plain flex items-center mb-4"><i class="pi pi-arrow-left mr-2" />{{ website?.title }}</NuxtLink>
    <h1 class="mb-12">Manage Links</h1>
    <GroupsManageGroupLinks :website-id="websiteId" />
    <Divider class="my-7" />
    <NuxtLink :to="`/groups/${websiteId}/portal`">
      <i class="pi pi-arrow-left mr-2" />
      Back to the Dashboard
    </NuxtLink>
  </div>
</template>
