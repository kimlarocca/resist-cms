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
    <h1>Manage Your Group's Signup Form</h1>
    <Divider class="my-7" />
    <h2 v-if="website?.title" class="mb-12">{{ website?.title }}</h2>
    <GroupsManageSignupForm :website-id="websiteId" />
  </div>
</template>
