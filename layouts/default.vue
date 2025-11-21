<template>
  <div class="gradient-container flex flex-col h-full">
    <the-header />
    <main class="mb-16">
      <NuxtPage />
    </main>
    <the-footer class="mt-auto" />
  </div>
</template>

<style scoped>
.gradient-container {
  min-height: 100vh;
  background: linear-gradient(to top, transparent 0%, white 50%),
    linear-gradient(to right, var(--red) 0%, var(--purple) 50%, var(--blue) 100%);
}
</style>
