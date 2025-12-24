<script setup>
const currentYear = new Date().getFullYear()

const { data: socialLinks } = await useAsyncData("social-links", () => getSocialLinks())
const { data: navigationLinks } = await useAsyncData("navigation-links", () =>
  getNavigationLinks()
)
const { data: websiteData } = await useAsyncData("website-data-footer", () =>
  getWebsiteData()
)
const { data: contentData } = await useAsyncData("content-data-footer", () =>
  getVisibilityBrigadeContent()
)

const emailAddress = computed(() => websiteData.value?.email || "")
const companyName = computed(() => websiteData.value?.title || "")
const description = computed(() => contentData.value?.hero_text || "")
</script>

<template>
  <div class="contrast py-16">
    <footer class="container p-4">
      <div class="grid lg:grid-cols-4 gap-16 mb-12">
        <div class="col-span-1 lg:col-span-2">
          <div class="p-5 bg-white rounded-lg w-fit">
            <VisibilityBrigadeLogo class="black" />
          </div>
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
}
.custom {
  max-width: 22px;
  width: 22px;
  height: 22px;
}
</style>
