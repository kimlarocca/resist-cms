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
        <Title>Resist CMS | Manage Your Group's Signup Form</Title>
      </Head>
    </Html>
    <h1 class="mb-4">Manage Your Group's Signup Form</h1>
    <NuxtLink :to="`/groups/${websiteId}/dashboard`" class="plain text-sm">
      <i class="pi pi-arrow-left mr-1" />Back to Team Site
    </NuxtLink>
    <Divider class="my-7" />
    <h2 v-if="website?.title" class="mb-12">{{ website?.title }}</h2>
    <GroupsManageSignupForm :website-id="websiteId" />
  </div>
</template>
