<template>
  <div class="default-container flex flex-col h-full">
    <TheHeader />
    <main class="mb-8">
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
