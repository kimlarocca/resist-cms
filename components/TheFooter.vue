<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="container p-4">
    <div class="bg-gray rounded-xl p-4 text-center">
      <p class="text-sm">
        Copyright © {{ currentYear }} ResistCMS.com. All Rights Reserved.
      </p>
    </div>
  </footer>
</template>

<style lang="scss"></style>
