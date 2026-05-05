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
    <p v-if="website?.url" class="mb-4">
      <a :href="website.url" target="_blank" class="plain text-sm">
        View Public Site <i class="pi pi-arrow-right text-xs ml-1" />
      </a>
    </p>
    <p v-else-if="website?.slug" class="mb-4">
      <a
        :href="`https://resistcms.com/${website.slug}`"
        target="_blank"
        class="plain text-sm"
      >
        View Public Site <i class="pi pi-arrow-right text-xs ml-1" />
      </a>
    </p>
    <p>
      Welcome to the team! Our dashboard is under construction, please check back later.
    </p>
  </div>
</template>
