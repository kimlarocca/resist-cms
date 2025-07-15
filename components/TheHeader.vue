<script setup>
const { setDarkMode, setLightMode, isDarkMode } = useDarkMode()
</script>

<template>
  <div>
    <header class="flex justify-between items-center">
      <NuxtLink to="/dashboard" class="plain clickable" aria-label="home">
        <img
          src="https://placehold.co/150x70?text=logo"
          alt="heavy petting logo"
          class="rounded-border"
        />
      </NuxtLink>
      <div class="flex justify-between items-center">
        <i
          v-if="isDarkMode"
          @click="setLightMode"
          class="pi pi-sun clickable mr-2"
        />
        <i v-else @click="setDarkMode" class="pi pi-moon clickable mr-2" />
      </div>
    </header>
    <Divider class="mt-4 mb-12" />
  </div>
</template>
