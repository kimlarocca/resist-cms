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
        <Title>Resist CMS | Manage Announcements</Title>
      </Head>
    </Html>
    <h1 class="mb-6">Manage Announcements</h1>
    <Divider class="my-7" />
    <h2 v-if="website?.title" class="mb-8">{{ website?.title }}</h2>
    <GroupsManageAnnouncements :website-id="websiteId" />
  </div>
</template>
