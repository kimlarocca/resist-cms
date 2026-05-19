<script setup>
const currentYear = new Date().getFullYear()
const { hostname } = useRequestURL()
</script>

<template>
  <footer class="bg-gray rounded-t-xl">
    <div class="container p-4 text-center">
      <p class="text-sm" v-if="hostname === 'login.votebyvalues.com'">
        Copyright © {{ currentYear }} VoteByValues.com. All Rights Reserved.
      </p>
      <p class="text-sm" v-else>
        Copyright © {{ currentYear }} ResistCMS.com. All Rights Reserved.
      </p>
    </div>
  </footer>
</template>

<style lang="scss"></style>
