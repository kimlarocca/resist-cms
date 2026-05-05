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
        <Title>Resist CMS | {{ website?.title }}</Title>
      </Head>
    </Html>
    <h1 class="mb-6">{{ website?.title }}</h1>
    <p>
      Welcome to the team! Our dashboard is under construction, please check back later.
    </p>
  </div>
</template>
