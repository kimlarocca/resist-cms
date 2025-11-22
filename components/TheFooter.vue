<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="bg-white-opacity-70 container rounded-xl">
    <div class="py-8 px-4 lg:px-24 text-center">
      <p class="small mb-3">
        This website was not requested or authorized by any candidate or candidate's
        committee. Paid for by
        <a href="https://papnj.com" target="_blank"> People Are People LLC</a>, 971 US
        Highway 202N #8014, Branchburg, NJ 08876.
      </p>
      <p class="small">
        Copyright © {{ currentYear }} — NJ11th.com. All Rights Reserved.
      </p>
    </div>
  </footer>
</template>

<style lang="scss">
.icon-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}
.custom {
  max-width: 16px;
  width: 16px;
  height: 16px;
}
</style>
