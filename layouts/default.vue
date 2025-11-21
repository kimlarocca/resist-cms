<template>
  <div class="gradient-container">
    <the-header />
    <main>
      <NuxtPage />
    </main>
    <the-footer class="mt-16" />
  </div>
</template>

<style scoped>
.gradient-container {
  min-height: 100vh;
  background: linear-gradient(to top, transparent 0%, white 50%),
    linear-gradient(to right, var(--red) 0%, var(--purple) 50%, var(--blue) 100%);
}
</style>
