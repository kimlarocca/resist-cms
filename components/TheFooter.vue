<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer>
    <Divider class="mt-12 mb-4" />
    <p class="small">
      Copyright © {{ currentYear }} papnj.com. All Rights Reserved.
    </p>
  </footer>
</template>
