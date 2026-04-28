<script setup>
const props = defineProps({
  websiteId: {
    type: Number,
    required: true,
  },
});
const { data: websiteData } = useNuxtData(`website-data-${props.websiteId}`);
const websiteTitle = computed(() => websiteData.value?.title || "");
</script>

<template>
  <div class="logo">
    <NuxtLink :to="`/${websiteData?.slug}`" class="plain clickable" aria-label="home">
      <img
        v-if="websiteData?.logo"
        :src="websiteData.logo"
        :alt="`${websiteTitle} logo`"
        class="logo-image"
      />
      <p v-else class="w-fit p-5 rounded-lg like-h3">{{ websiteTitle }}</p>
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped>
.logo {
  p {
    background: black;
    color: white;
  }
  &.inverse {
    p {
      background: white;
      color: black;
    }
  }
}
.logo-image {
  height: 100px;
  width: auto;
}
</style>
