<script setup>
const { data: websiteData } = await useAsyncData("website-data", () => getWebsiteData())
const websiteTitle = computed(() => websiteData.value?.title || "")
</script>

<template>
  <NuxtLink :to="`/${websiteData?.slug}`" class="logo plain clickable" aria-label="home">
    <img
      v-if="websiteData?.logo"
      :src="websiteData.logo"
      :alt="`${websiteTitle} logo`"
      class="logo-image"
    />
    <p v-else class="like-h3">{{ websiteTitle }}</p>
  </NuxtLink>
</template>

<style lang="scss" scoped>
.logo {
  p {
    background: transparent;
    color: #fff;
    margin-top: -5px;
  }
  &.black {
    p {
      color: #000;
    }
  }
}
.logo-image {
  height: 100px;
  width: auto;
}
</style>
