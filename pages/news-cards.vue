<script setup>
definePageMeta({
  middleware: "auth",
})
</script>

<template>
  <div class="container p-4">
    <h1>Manage News Cards</h1>
    <Divider class="my-7" />
    <NewsManageNewsCards />
  </div>
</template>
