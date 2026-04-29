<template>
  <section
    v-if="content?.instagram_widget_id || content?.social_embed_code"
    id="gallery"
    class="mb-40"
  >
    <div
      v-if="content?.instagram_widget_id"
      :class="content.instagram_widget_id"
      data-elfsight-app-lazy
    />
  </section>
</template>

<script setup>
const { data: content } = await useAsyncData("instagram-gallery-content", () =>
  getVisibilityBrigadeContent()
)

onMounted(() => {
  // Wait for the instagram widget div to be rendered
  const checkForWidget = setInterval(() => {
    const widgetDiv = document.querySelector(`[class*="elfsight-app"]`)
    if (widgetDiv) {
      clearInterval(checkForWidget)

      // Now start observing for the unwanted link
      const observer = new MutationObserver(() => {
        const links = document.querySelectorAll("a[title]")
        links.forEach((link) => {
          if (link.title.toLowerCase().includes("free instagram feed widget")) {
            link.remove()
          }
        })
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    }
  }, 100)

  // Clean up after 10 seconds if widget never loads
  setTimeout(() => clearInterval(checkForWidget), 10000)
})
</script>

<style lang="scss" scoped>
// instagram feed overrides
:deep(.es-widget button) {
  background: black !important;
  border-radius: 24px !important;
  padding: 0 2rem !important;
  text-transform: uppercase !important;
  font-weight: 500 !important;
  color: white !important;
  font-size: 1.25rem !important;
  height: 48px !important;
  line-height: 48px !important;
  width: fit-content !important;
  opacity: 1 !important;
  transition: var(--transition) !important;
  &:hover {
    opacity: var(--opacity-on-hover) !important;
  }
}
</style>
