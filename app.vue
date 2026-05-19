<script setup lang="ts">
const { hostname } = useRequestURL()
const appTitle = hostname === "login.votebyvalues.com" ? "Vote By Values" : "Resist CMS"
useHead({ title: appTitle })
</script>
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
