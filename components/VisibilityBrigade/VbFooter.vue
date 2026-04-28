<script setup>
const props = defineProps({
  websiteId: {
    type: Number,
    required: true,
  },
})
const route = useRoute()
const currentYear = new Date().getFullYear()

const { data: socialLinks } = await useAsyncData(`social-links-${props.websiteId}`, () => getSocialLinks(props.websiteId))
const { data: navigationLinks } = await useAsyncData(`navigation-links-${props.websiteId}`, () =>
  getNavigationLinks(props.websiteId)
)
const { data: websiteData } = await useAsyncData(`website-data-footer-${props.websiteId}`, () =>
  getWebsiteData(props.websiteId)
)
const { data: contentData } = await useAsyncData(`content-data-footer-${props.websiteId}`, () =>
  getVisibilityBrigadeContent(props.websiteId)
)

const emailAddress = computed(() => websiteData.value?.email || "")
const companyName = computed(() => websiteData.value?.title || "")
const description = computed(() => contentData.value?.hero_text || "")
const termsUrl = computed(() =>
  websiteData.value?.terms ? `/${route.params.slug}/terms` : null
)
const privacyUrl = computed(() =>
  websiteData.value?.privacy_policy ? `/${route.params.slug}/privacy` : null
)
</script>

<template>
  <div class="contrast py-16">
    <footer class="p-6">
      <div class="grid lg:grid-cols-4 gap-16 mb-12">
        <div class="col-span-1 lg:col-span-2">
            <VisibilityBrigadeLogo :website-id="props.websiteId" class="inverse" />
          <p class="mt-5">{{ description }}</p>
        </div>
        <div class="col-span-1">
          <p class="like-h4 mb-4">Quick Links</p>
          <div v-for="link in navigationLinks" :key="link.label">
            <p class="mb-2">
              <NuxtLink :to="link.href + link.hash" :target="link.target">
                {{ link.label }}
              </NuxtLink>
            </p>
          </div>
        </div>
        <div class="col-span-1">
          <p class="like-h4 mb-5">Connect</p>
          <p class="mb-5">
            <i class="pi pi-envelope mr-2" />
            <a :href="`mailto:${emailAddress}`">
              {{ emailAddress }}
            </a>
          </p>
          <div class="flex space-x-4">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.url"
              :aria-label="social.label"
              class="icon-link plain clickable"
            >
              <img
                v-if="social.icon === 'custom'"
                :src="social.iconSrc"
                :alt="social.label"
                class="custom filter invert"
              />
              <i v-else :class="social.icon" class="text-2xl"></i>
            </a>
          </div>
        </div>
      </div>
      <p class="small">
        Copyright © {{ currentYear }} {{ companyName }}. All Rights Reserved.
        <span v-if="termsUrl || privacyUrl" class="ml-4">
          <NuxtLink v-if="termsUrl" :to="termsUrl" class="mr-4"
            >Terms of Service</NuxtLink
          >
          <NuxtLink v-if="privacyUrl" :to="privacyUrl">Privacy Policy</NuxtLink>
        </span>
      </p>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
footer {
  color: white;
}
a {
  color: white;
}
.visibility-brigade-logo {
  width: 220px;
}
.icon-link {
  display: flex;
  align-items: center;
  color: white;
  max-width: 22px;
  width: 22px;
  height: 22px;
}
.custom {
  max-width: 22px;
  width: 22px;
  height: 22px;
}
</style>
