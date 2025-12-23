<template>
  <div class="default-container flex flex-col h-full">
    <TheHeader />
    <main class="mt-32 mb-8">
      <NuxtPage />
    </main>
    <TheFooter class="mt-auto" />
  </div>
</template>

<style scoped>
.default-container {
  min-height: 100vh;
}
</style>
